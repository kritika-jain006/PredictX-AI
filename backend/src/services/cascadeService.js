/**
 * cascadeService.js — Cross-Correlation Failure Cascade Engine
 *
 * Analyzes multiple telemetry metrics together to detect
 * component failure chains — where one failing part triggers
 * cascading failures in other parts of the system.
 */

const analyzeCascade = (telemetry) => {
    const {
        cpuTemp      = 0,
        cpuUsage     = 0,
        fanRpm       = 0,
        ramUsage     = 0,
        diskUsage    = 0,
        diskReadMBps = 0,
        diskWriteMBps= 0,
        batteryHealth= 100,
        batteryPower = 0,
        gpuTemp      = 0,
        smartHealth  = 100,
        processCount = 0
    } = telemetry;

    const chains = [];

    // ── CASCADE 1: Cooling Failure → Thermal Overload → CPU Throttle → System Crash
    if (fanRpm < 1500 && cpuTemp > 65) {
        chains.push([
            { step: 1, component: "Cooling Fan",    risk: "warning",  description: `Fan RPM critically low (${fanRpm} RPM). Cooling capacity degraded.`, timeframe: "Now" },
            { step: 2, component: "CPU",             risk: "warning",  description: `CPU temperature rising (${cpuTemp}°C). Insufficient airflow.`, timeframe: "Minutes" },
            { step: 3, component: "CPU",             risk: "critical", description: "Thermal throttling imminent. CPU will reduce clock speed to prevent damage.", timeframe: "Hours" },
            { step: 4, component: "System",          risk: "critical", description: "Risk of unexpected shutdown or BSOD due to sustained thermal overload.", timeframe: "Days" }
        ]);
    }

    // ── CASCADE 2: Disk Full → OS Paging → RAM Thrashing → System Freeze
    if (diskUsage > 85 && ramUsage > 80) {
        chains.push([
            { step: 1, component: "Disk",            risk: "warning",  description: `Disk usage at ${diskUsage}%. OS has limited space for virtual memory paging.`, timeframe: "Now" },
            { step: 2, component: "RAM",             risk: "warning",  description: `RAM at ${ramUsage}%. System is paging to disk to compensate.`, timeframe: "Now" },
            { step: 3, component: "Disk",            risk: "critical", description: "Excessive read/write cycles from paging accelerating disk wear.", timeframe: "Weeks" },
            { step: 4, component: "System",          risk: "critical", description: "System freeze or data corruption likely if disk fills completely.", timeframe: "Weeks" }
        ]);
    }

    // ── CASCADE 3: Battery Degradation → Power Instability → Data Corruption
    if (batteryHealth < 60 && batteryPower > 0) {
        chains.push([
            { step: 1, component: "Battery",         risk: "warning",  description: `Battery health at ${batteryHealth}%. Charge capacity severely degraded.`, timeframe: "Now" },
            { step: 2, component: "Power System",    risk: "warning",  description: "Inconsistent power delivery during high-load operations.", timeframe: "Days" },
            { step: 3, component: "Disk",            risk: "critical", description: "Sudden power loss risk during disk writes — potential data corruption.", timeframe: "Weeks" },
            { step: 4, component: "System",          risk: "critical", description: "Risk of unrecoverable data loss or OS corruption on unexpected shutdown.", timeframe: "Weeks" }
        ]);
    }

    // ── CASCADE 4: S.M.A.R.T Degradation → Disk Failure → Data Loss
    if (smartHealth < 80) {
        chains.push([
            { step: 1, component: "Disk (S.M.A.R.T)", risk: "warning",  description: `S.M.A.R.T health at ${smartHealth}%. Bad sectors detected on drive.`, timeframe: "Now" },
            { step: 2, component: "Disk",              risk: "critical", description: "Read/write errors increasing. Disk approaching end-of-life.", timeframe: "Weeks" },
            { step: 3, component: "OS",                risk: "critical", description: "OS files or application data at risk of corruption.", timeframe: "Weeks" },
            { step: 4, component: "System",            risk: "critical", description: "Complete disk failure and total data loss without immediate backup.", timeframe: "Months" }
        ]);
    }

    // ── CASCADE 5: High CPU + High GPU Thermal → PCB Stress → Motherboard Damage
    if (cpuTemp > 80 && gpuTemp > 75) {
        chains.push([
            { step: 1, component: "CPU",             risk: "critical", description: `CPU at ${cpuTemp}°C — dangerously high.`, timeframe: "Now" },
            { step: 2, component: "GPU",             risk: "critical", description: `GPU at ${gpuTemp}°C — simultaneous thermal load on PCB.`, timeframe: "Now" },
            { step: 3, component: "Motherboard",     risk: "critical", description: "Combined thermal stress on PCB traces and VRMs. Accelerated aging.", timeframe: "Months" },
            { step: 4, component: "System",          risk: "critical", description: "Risk of permanent motherboard damage if temperatures not reduced.", timeframe: "Months" }
        ]);
    }

    // ── CASCADE 6: Process Overload → RAM Exhaustion → Disk Thrashing → Unresponsive System
    if (processCount > 250 && ramUsage > 88) {
        chains.push([
            { step: 1, component: "OS Processes",    risk: "warning",  description: `${processCount} active processes consuming excessive resources.`, timeframe: "Now" },
            { step: 2, component: "RAM",             risk: "warning",  description: `RAM exhausted at ${ramUsage}%. Kernel forcing memory to swap.`, timeframe: "Now" },
            { step: 3, component: "Disk",            risk: "warning",  description: "Heavy swap file usage degrading disk performance and lifespan.", timeframe: "Hours" },
            { step: 4, component: "System",          risk: "critical", description: "System becoming unresponsive. Applications may crash or hang.", timeframe: "Hours" }
        ]);
    }

    // Return the most severe cascade (most steps, highest risk)
    if (chains.length === 0) return null;

    // Pick the chain with the most critical steps
    chains.sort((a, b) => {
        const critA = a.filter(s => s.risk === "critical").length;
        const critB = b.filter(s => s.risk === "critical").length;
        return critB - critA;
    });

    return chains[0];
};

module.exports = { analyzeCascade };
