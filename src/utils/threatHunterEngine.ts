import { ExtractedIOC, MitreTechnique, RemediationAction, LateralHuntQuery } from '../types';

/**
 * Generates proactive hunt queries derived from the current telemetry,
 * targeted at unobserved lateral movement vectors that attackers typically pivot to.
 */
export function generateProactiveLateralHuntQueries(
  iocs: ExtractedIOC[],
  techniques: MitreTechnique[],
  actions: RemediationAction[]
): LateralHuntQuery[] {
  const queries: LateralHuntQuery[] = [];

  const compromisedIps = iocs.filter(i => i.type === 'ip').map(i => i.value);
  const compromisedUsers = iocs.filter(i => i.type === 'user').map(i => i.value);
  const targetComponents = actions.map(a => a.targetComponent);
  const primaryUser = compromisedUsers[0] || 'deploy';
  const primaryIp = compromisedIps[0] || '198.51.100.42';

  // Has SSH or credential spray been identified?
  const hasCredentialAccess = techniques.some(
    t => t.id === 'T1110' || t.tactic === 'Credential Access' || t.name.toLowerCase().includes('brute')
  );

  // Has Web Shell or Execution occurred?
  const hasWebShellOrRCE = techniques.some(
    t => t.id === 'T1505.003' || t.id === 'T1059.004' || t.name.toLowerCase().includes('shell')
  );

  // Has C2 beaconing occurred?
  const hasC2 = techniques.some(
    t => t.tactic === 'Command and Control' || t.id.startsWith('T1071')
  );

  // Has Privilege Escalation occurred?
  const hasPrivEsc = techniques.some(
    t => t.tactic === 'Privilege Escalation' || t.id === 'T1548.001'
  );

  // Query 1: SSH Hijacking / Lateral Pivot via Stolen Keys (T1021.004)
  queries.push({
    id: 'HUNT-LAT-001',
    techniqueId: 'T1021.004',
    techniqueName: 'SSH Hijacking & Key Reuse',
    tactic: 'Lateral Movement',
    threatHypothesis: `Attacker with access to user '${primaryUser}' is searching for id_rsa/authorized_keys or active SSH agent sockets to jump laterally to internal subnets.`,
    targetArtifact: '~/.ssh/id_rsa, /tmp/ssh-*, /proc/*/environ (SSH_AUTH_SOCK)',
    queryType: 'OSQUERY',
    riskTier: 'HIGH',
    rationale: 'Post-compromise actors leverage in-memory SSH agents and unencrypted private keys to pivot silently across adjacent server nodes without triggering password brute-force alerts.',
    mitreRef: 'https://attack.mitre.org/techniques/T1021/004/',
    query: `SELECT p.pid, p.name, p.cmdline, p.path, f.path AS socket_path 
FROM processes p 
JOIN process_open_sockets s ON p.pid = s.pid 
LEFT JOIN file f ON f.path LIKE '/tmp/ssh-%' 
WHERE p.name IN ('ssh', 'scp', 'rsync', 'sftp') 
   OR p.cmdline LIKE '%-i %id_rsa%' 
   OR p.cmdline LIKE '%authorized_keys%';`
  });

  // Query 2: Internal SMB/NFS Share Mounting & Credential Traversal (T1021.002)
  queries.push({
    id: 'HUNT-LAT-002',
    techniqueId: 'T1021.002',
    techniqueName: 'SMB / Windows Admin Shares Lateral Recon',
    tactic: 'Lateral Movement',
    threatHypothesis: `Adversary executing automated share enumeration (smbclient, rpcclient, net use) from compromised Linux container to locate unprotected internal storage.`,
    targetArtifact: 'smbclient, mount.cifs, smb.conf, /etc/fstab',
    queryType: 'SIGMA_SPLUNK',
    riskTier: hasPrivEsc ? 'CRITICAL' : 'HIGH',
    rationale: 'Attackers scan RFC1918 internal subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) for administrative SMB shares (C$, ADMIN$) to drop secondary payloads.',
    mitreRef: 'https://attack.mitre.org/techniques/T1021/002/',
    query: `index=linux_audit (comm="smbclient" OR comm="rpcclient" OR comm="mount.cifs" OR comm="nmap")
| stats count earliest(_time) as first_seen latest(_time) as last_seen by host, user, cmd, dest_ip
| where match(dest_ip, "^(10\\.|172\\.(1[6-9]|2[0-9]|3[0-1])\\.|192\\.168\\.)")
| eval lateral_threat_indicator="Internal Share Pivot Probe"`
  });

  // Query 3: Remote Services & Ansible/Puppet Orchestration Abuse (T1021.001 / T1072)
  queries.push({
    id: 'HUNT-LAT-003',
    techniqueId: 'T1021',
    techniqueName: 'Remote Services & SOCKS Proxy Tunneling',
    tactic: 'Lateral Movement',
    threatHypothesis: `Compromised host is being converted into a SOCKS5 pivot proxy or SSH reverse dynamic port forward (-D / -R) to tunnel internal intranet traffic through port 443/22.`,
    targetArtifact: 'SSH reverse tunnels, chisel, ligolo-ng, gost, revsocks',
    queryType: 'ELASTIC_KQL',
    riskTier: hasC2 ? 'CRITICAL' : 'HIGH',
    rationale: 'Actors establish encrypted reverse proxy tunnels to route external exploit frameworks through the breached perimeter node directly onto internal staging clusters.',
    mitreRef: 'https://attack.mitre.org/techniques/T1090/002/',
    query: `process.name: ("ssh" or "chisel" or "ligolo" or "gost" or "frpc" or "socat") 
and (
  process.args: ("-R" or "-D" or "-L" or "client" or "reverse" or "tunnel") 
  or destination.port: (1080 or 8080 or 9050 or 3128 or 4444)
)`
  });

  // Query 4: Sudo & Credential Harvesting across Local PTS Sessions (T1563.002)
  queries.push({
    id: 'HUNT-LAT-004',
    techniqueId: 'T1563.002',
    techniqueName: 'RDP/SSH Session Hijacking & PTS Snooping',
    tactic: 'Lateral Movement',
    threatHypothesis: `Attacker attempting to inject keystrokes into existing admin pts pseudo-terminals or attach GDB to other users' bash processes to sniff credentials.`,
    targetArtifact: '/dev/pts/*, /proc/*/mem, ptrace, gdb, strace',
    queryType: 'BASH_FORENSIC',
    riskTier: 'CRITICAL',
    rationale: 'If lateral movement is blocked on the wire, sophisticated actors snoop active administrator TTY sessions (/dev/pts/*) to harvest sudo passwords as other engineers log in.',
    mitreRef: 'https://attack.mitre.org/techniques/T1563/002/',
    query: `# Real-time bash forensic probe for active terminal sniffing and memory dumping
grep -E '(ptrace|gdb|strace|ttysnoop|shissue)' /var/log/audit/audit.log 2>/dev/null || \
lsof /dev/pts/* 2>/dev/null | awk '$4 ~ /[0-9]+[uw]/' | grep -v sshd`
  });

  // Query 5: Container Breakout & Kubelet Lateral Pivot (T1610 / T1613)
  queries.push({
    id: 'HUNT-LAT-005',
    techniqueId: 'T1613',
    techniqueName: 'Container/Kubelet API Lateral Traversal',
    tactic: 'Lateral Movement',
    threatHypothesis: `Attacker querying local container environment variables and mounted service account tokens (/var/run/secrets/kubernetes.io/serviceaccount) to pivot to the Kubernetes control plane.`,
    targetArtifact: 'token, ca.crt, KUBERNETES_SERVICE_HOST, curl https://10.96.0.1:443',
    queryType: 'SIGMA_SPLUNK',
    riskTier: 'HIGH',
    rationale: 'In cloud-native or Docker environments, initial web application compromise frequently pivots into cluster-wide lateral spread via exposed service account tokens.',
    mitreRef: 'https://attack.mitre.org/techniques/T1613/',
    query: `index=container_logs (uri_path="/api/v1/namespaces/*" OR uri_path="/api/v1/pods/*") 
| search http_user_agent="curl/*" OR http_user_agent="kubectl/*"
| stats count by src_ip, uri_path, status, http_user_agent
| where status=200`
  });

  return queries;
}
