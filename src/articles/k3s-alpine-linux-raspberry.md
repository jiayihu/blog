---
title: Install k3s with Alpine Linux on Raspberry Pi 3B+
subtitle: A step to step guide to run k3s on Alpine Linux using Ansible playbook
date: 2020-12-19
layout: article.html
cover: /images/gmail-smart-compose-keras/cover.png
coverColor: \#EAADAC
---

I've been recently started experimenting with Raspberry Pi 3B+ and Kubernetes for my thesis. Because of the constrained resources on devices like the Pis, I've chosen [K3s](https://k3s.io/) as Kubernetes distribution meant for IoT and Edge, though I have more to say about that later.

Setting up Ubuntu Server and K3s on the Raspberry Pi cluster was pretty straightforward thanks to [k3s-ansible](https://github.com/k3s-io/k3s-ansible). I've started using Ansible only recently, but I'm loving it. It's a well-done configuration management tool that makes configuring and running commands on the nodes much more effortless. You can run commands across all the nodes or define automated configuration called [playbooks](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html). We're going to use it in this blog post.

Because of the limited available RAM (1GB on my Pi 3B+), I decided to migrate from Ubuntu Server to Alpine Linux. Ubuntu Server was eating about ~400MB, whereas k3s server uses an additional ~400MB even without any application running. K3s agent is around 128MB of memory usage. That doesn't leave very much memory available con the server, even before running other applications like Prometheus monitoring. That's why I decided to move to [Alpine Linux](https://alpinelinux.org/), which is often used as base image in containers because it's very minimal and lightweight. It takes about 120MB uncompressed and it uses only about 50MB of RAM in my case. It can be even less resource-demanding if one is using the container distribution, such as only 8MB of RAM.

Let's cut the crap and jump to the point.

## Installing 

Download your favourite Alpine Linux distribution at [https://alpinelinux.org/downloads/](https://alpinelinux.org/downloads/). The distribution I've picked is `aarch64` since the Raspberry Pi 3B+ has 64bit cores.

After having unzipped the files, copy them over to the SD card. Remove the SD card and boot the Pi with it.

After the initial setup with `setup-alpine` run the following commands.

Update the packages:

```
apk update
apk upgrade
```

Enable root SSH so that we can continue the following commands on our usual laptop/computer. Alpine Linux uses [OpenRC](https://docs.alpinelinux.org/user-handbook/0.1a/Working/openrc.html) instead of `systemd`, therefore we'll have to restart the `sshd` service with `rc-service`.

```
vi /etc/ssh/sshd_config
rc-service sshd restart
```

Add `/etc/init.d` and `add /root/.ssh` to `lbu`. lbu is the [Alpine local backup](https://wiki.alpinelinux.org/wiki/Alpine_local_backup) because it's diskless by default, meaning that all the modifications must be saved to an overlay file (.apkovl) to make them survive a reboot.

You can try different instructions at [Raspberry Pi 4 - Persistent system acting as a NAS and Time Machine](https://wiki.alpinelinux.org/wiki/Raspberry_Pi_4_-_Persistent_system_acting_as_a_NAS_and_Time_Machine) if you want a fully classic persistent filesystem, but you have to start from scratch making the partitions. Personally, I was able to create the partitions but then I had issues with the `wlan0` not working, but I didn't actually invest very much time to investigate the issue.

What we're configuring in this blog post is a diskless minimal Alpine Linux. We'll manually commit changes so that we can't check and choose what to actually persist after a reboot. Then we'll create an automatically persisted [Overlay filesystem](https://wiki.archlinux.org/index.php/Overlay_filesystem) for only some specific folders:

- `/root` the home root where we download binaries
- `/var/lib/rancher` where k3s saves data
- `/usr` to save packages in the overlay layer instead of the lbu backup, but it's optional

This configuration allows having a minimal Alpine Linux reset after each reboot, whereas k3s will be saved in the overlay layer. So after a reboot, k3s will still have the information like authentication token, node passwords, DNS records etc. kept. However, in case of trouble, the overlay layer can be deleted, the system reset with reboot and k3s reinstalled automatically using Ansible.

Add `/etc/init.d` and `/root/.ssh` to the folders included by lbu. By default it tracks only `/etc`, with `/etc/init.d` excluded. We also set the lbu backup-limit up to 5 versions, so that you don't always need to overwrite the previous backup if you are experimenting with some changes.

```
lbu add /etc/init.d
lbu add /root/.ssh
vi /etc/lbu/lbu.conf # BACKUP_LIMIT=5
```

Register the `wpa_supplicant` service, otherwise, in my case I wasn't able to get a DHCP lease from the wifi after reboot. More info is available at [https://gitlab.alpinelinux.org/alpine/aports/-/issues/8025](https://gitlab.alpinelinux.org/alpine/aports/-/issues/8025), with also an example of what to write in `/etc/init.d/networking`.

```
# Add wpa_supplicant service
rc-update add wpa_supplicant default
vi /etc/init.d/networking # need wpa_supplicant
rc-update -u
lbu ci -d
```

Restrict SSH login with SSH key, disabling password authentication: `ssh-copy-id root@192.168.1.100`. This needs to be run in your laptop, not within the SSH session and `192.168.1.100` is the IP address of the Raspberry Pi.

After the key have been copied, check it is at `~/.ssh/authorized_keys`. The disable password authentication.

```
vi /etc/ssh/sshd_config # PasswordAuthentication no
rc-service sshd restart
```

Install python needed by Ansible

```
apk add python3
```

Now let's create the Overlay filesystem. Commands are adapted from [https://wiki.alpinelinux.org/wiki/Raspberry_Pi#Persistent_storage](https://wiki.alpinelinux.org/wiki/Raspberry_Pi#Persistent_storage):

```
mount /media/mmcblk0p1 -o rw,remount
sed -i 's/vfat\ ro,/vfat\ rw,/' /etc/fstab
dd if=/dev/zero of=/media/mmcblk0p1/persist.img bs=1024 count=0 seek=1048576
apk add e2fsprogs
mkfs.ext4 /media/mmcblk0p1/persist.img
echo "/media/mmcblk0p1/persist.img /media/persist ext4 rw,relatime,errors=remount-ro 0 0" >> /etc/fstab
mkdir /media/persist 
mount -a

# Persist /usr
mkdir /media/persist/usr
mkdir /media/persist/.work
echo "overlay /usr overlay lowerdir=/usr,upperdir=/media/persist/usr,workdir=/media/persist/.work 0 0" >> /etc/fstab 
mount -a

# Persist /var/lib/rancher
mkdir /media/persist/rancher 
mkdir /media/persist/.work-rancher
mkdir /var/lib/rancher
echo "overlay /var/lib/rancher overlay lowerdir=/var/lib/rancher,upperdir=/media/persist/rancher,workdir=/media/persist/.work-rancher 0 0" >> /etc/fstab 
mount -a

# Persist /root
mkdir /media/persist/root 
mkdir /media/persist/.work-root
echo "overlay /root overlay lowerdir=/root,upperdir=/media/persist/root,workdir=/media/persist/.work-root 0 0" >> /etc/fstab 
mount -a

cat /etc/fstab # Check everything is fine
```

Enable OpenRC logging, by setting `rc_logger="YES"` in the file. You will find service boot logs at `/var/log/rc.log`.

```
vi /etc/rc.conf # rc_logger="YES"
```

Commit all changes and reboot the machine.

```
lbu ci -d
reboot
```

Check that everything is working as expected. Check that `python3` is available as well as the folder `/var/lib/rancher`. Now it's time to install k3s and we're using Ansible for that.

## Install k3s with Ansible

The changes needed to run Ansible with `k3s-ansible` are available in my Pull Request [k3s-ansible#107](https://github.com/k3s-io/k3s-ansible/pull/107/). You can copy them into your local Ansible configuration. 

Compared to the standard Ubuntu installation, the following steps are different or needed in Alpine. I'll write the bare shell commands for anyone not using Ansible, although I strongly encourage to use the latter and see my PR for the configuration.

Add the `cgroup` mount point: 

```
echo "cgroup /sys/fs/cgroup cgroup defaults 0 0" >> /etc/fstab
```

Add the following lines to `/etc/cgconfig.conf` (e.g. `vi /etc/cgconfig.conf`):

```
mount {
  cpuacct = /cgroup/cpuacct;
  memory = /cgroup/memory;
  devices = /cgroup/devices;
  freezer = /cgroup/freezer;
  net_cls = /cgroup/net_cls;
  blkio = /cgroup/blkio;
  cpuset = /cgroup/cpuset;
  cpu = /cgroup/cpu;
}
```

Enable cgroup via boot commandline, by appending the following line to `/media/mmcblk0p1/cmdline.txt`. `/media/mmcblk0p1` is where the boot files are saved, including the lbu backups and the overlay image (`persist.img`). It's usually at path `/boot` :

```
default_kernel_opts="...  cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory"
```

Now you can download the k3s binaries. If you want to enable them as services running at boot, you can create the following services at `/etc/init.d/k3s` and symlink at `/etc/runlevels/default/k3s` to run them as `default` runlevel.

K3s server

```
#!/sbin/openrc-run
name="k3s server"
command="/usr/local/bin/k3s"
command_args="server"
command_background=true
pidfile="/run/${RC_SVCNAME}.pid"
output_log="/var/log/k3s.log"
error_log="/var/log/k3s.err"
```

K3s agent, where `{{ master_ip }}` is the IP of the k3s server and `{{ token }}` can be found at `/var/lib/rancher/k3s/server/node-token` on the server node. It will be available after the first successful run of k3s server.

```
#!/sbin/openrc-run
name="k3s agent"
command="/usr/local/bin/k3s"
command_args="agent --server https://{{ master_ip }}:6443 --token {{ token }}"
command_background=true
pidfile="/run/${RC_SVCNAME}.pid"
output_log="/var/log/k3s.log"
error_log="/var/log/k3s.err"
```

Check if the changes are working as intended and reboot.

```
lbu status
lbu ci -d
reboot
```

After the reboot, the services should start and the k3s cluster will be up and running for the first time. Copy the kubeconfig from the server node to laptop.

```
scp root@192.168.1.1:~/.kube/config ~/.kube/config
```

Still on the laptop shell, set the `KUBECONFIG` env variable and check if the cluster is up and running.

```
export KUBECONFIG=~/.kube/config
kubectl get nodes
```

You should have something like:

```
NAME     STATUS   ROLES    AGE     VERSION
rasp-1   Ready    master   3m   v1.17.5+k3s1
rasp-3   Ready    <none>   3m   v1.17.5+k3s1
rasp-4   Ready    <none>   3m   v1.17.5+k3s1
rasp-2   Ready    <none>   3m   v1.17.5+k3s1
```

## Resources

The previous commands are the result of my experiments. I'll link the articles which helped me configure the system.

- [k3s architecture](https://rancher.com/docs/k3s/latest/en/architecture/) to know where token and passwords are stored
- [k3s bootstrap on Alpine Linux](https://d-heinrich.medium.com/k3s-bootstrap-on-alpine-linux-c207c85c3f3d) bare commands to run without Ansible
- [Alpine Linux Init System](https://wiki.alpinelinux.org/wiki/Alpine_Linux_Init_System) as quick cheatsheet of OpenRC commands
- [Alpine local backup](https://wiki.alpinelinux.org/wiki/Alpine_local_backup) to learn about lbu
- [wiki.alpinelinux/Raspberry Pi](https://wiki.alpinelinux.org/wiki/Raspberry_Pi) from which most commands are taken
- [OpenRC Service Script Writing Guide](https://github.com/OpenRC/openrc/blob/master/service-script-guide.md)

## Conclusions on Alpine Linux and K3s

The whole process is challenging but the results are worth it.

Alpine Linux uses only ~55MB on my Raspberry Pi 3B+. Now, most resources are used by k3s-server and k3s-agent. K3s-server now takes about 500MB of RAM and I guess it's because Go prefers to increase the memory consumption instead of running garbage collection cycles. K3s-agent takes approx 128MB of memory.

There's an ongoing issue [k3s#2278](https://github.com/k3s-io/k3s/issues/2278) about k3s CPU and memory usage, which should be less considering it's described as k8s for IoT and Edge. I hope it improves in future.
