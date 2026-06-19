import psutil
import socket
import json
import requests
import subprocess
import re
import time
from datetime import datetime

API_URL = "http://localhost:5001/api/telemetry"


def get_battery_health():
    try:
        output = subprocess.check_output(
            ["system_profiler", "SPPowerDataType"],
            text=True
        )

        match = re.search(r"Maximum Capacity:\s*(\d+)%", output)

        if match:
            return int(match.group(1))

    except:
        pass

    return 0


def collect_metrics():

    battery = psutil.sensors_battery()

    data = {
        "deviceId": socket.gethostname(),

        "cpuUsage": round(psutil.cpu_percent(interval=1), 2),

        "cpuTemp": 0,

        "ramUsage": round(psutil.virtual_memory().percent, 2),

        "diskUsage": round(psutil.disk_usage("/").percent, 2),

        "batteryHealth": get_battery_health(),

        "cpuPower": 0,

        "batteryPower": 0,

        "fanRpm": 0,

        "smartHealth": 0,

        "gpuUsage": 0,

        "gpuTemp": 0,

        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    return data


while True:

    payload = collect_metrics()

    print(json.dumps(payload, indent=4))

    try:
        response = requests.post(
            API_URL,
            json=payload,
            timeout=5
        )

        print("Status:", response.status_code)
        print("Response:", response.text)

    except Exception as e:
        print("Error:", e)

    print("-" * 50)

    time.sleep(10)