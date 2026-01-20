# Connect Wazuh to SOC Noise Killer

To feed real alerts into this tool, you need to add an Integration block to your Wazuh Manager's configuration.

## Step 1: Get Your IP
Find the IP address of the computer running this tool (e.g., `192.168.1.X`).
> **Note**: Do NOT use `localhost` or `127.0.0.1` inside the Wazuh config if Wazuh is running on a different VM or server. It must be the IP reachable from the Wazuh server.

## Step 2: Edit `ossec.conf`
1. Open the configuration file on your Wazuh Manager:
   ```bash
   nano /var/ossec/etc/ossec.conf
   ```
2. Add the following block (usually near the bottom, before `</ossec_config>`):

   ```xml
   <integration>
     <name>custom-soc-tool</name>
     <hook_url>http://YOUR_PC_IP:5000/api/alerts</hook_url>
     <level>3</level> <!-- Send alerts with level 3 and above -->
     <alert_format>json</alert_format>
   </integration>
   ```
   *Replace `YOUR_PC_IP` with your actual IP address.*

## Step 3: Restart Wazuh
Apply the changes:
```bash
systemctl restart wazuh-manager
```

## Step 4: Verify
1. Watch the terminal where you are running the `node src/server.js` command.
2. Trigger an alert on Wazuh (e.g., try a wrong password login on an agent).
3. If successful, you will see a new Incident appear on your Dashboard!
