const os = require("os");
const disk = require("diskusage");

// Función para obtener el uso y el nombre del CPU
function getCpuUsage() {
  const cpus = os.cpus();
  const cpuModel = cpus[0].model; // Obtenemos el modelo de la CPU
  let totalUser = 0,
    totalSys = 0,
    totalIdle = 0,
    totalTime = 0;

  cpus.forEach((cpu) => {
    const { user, sys, idle } = cpu.times;
    totalUser += user;
    totalSys += sys;
    totalIdle += idle;
    totalTime += user + sys + idle + cpu.times.nice + cpu.times.irq;
  });

  const percentageUsed = (((totalTime - totalIdle) / totalTime) * 100).toFixed(
    2
  );
  return {
    model: cpuModel, // Devolvemos el modelo de la CPU
    percentageUsed,
    totalTime: (totalTime / 1000).toFixed(2), // En segundos
  };
}

// Función para obtener el uso de disco
async function getDiskUsage() {
  try {
    const diskPath = os.platform() === "win32" ? "C:/" : "/";
    const { available, total } = await disk.check(diskPath);
    return {
      available: (available / (1024 * 1024 * 1024)).toFixed(2),
      total: (total / (1024 * 1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    return { available: "Desconocido", total: "Desconocido" };
  }
}

// Función para obtener el uso de RAM
function getRamUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  return {
    used: (usedMemory / (1024 * 1024 * 1024)).toFixed(2),
    total: (totalMemory / (1024 * 1024 * 1024)).toFixed(2),
  }; 
}

module.exports = { getCpuUsage, getDiskUsage, getRamUsage };
