// Inisialisasi Grafik
const ctx = document.getElementById('historyChart').getContext('2d');
const historyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Jarak Air (cm)',
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            data: [],
            fill: true,
            tension: 0.4
        }, {
            label: 'Kelembapan Tanah (%)',
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            data: [],
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true, max: 100 }
        },
        animation: {
            duration: 400 // Animasi chart lebih responsif
        }
    }
});

// === VARIABEL AWAL UNTUK SIMULASI FISIK ===
let currentSoil = 60;   // Kelembapan awal 60%
let currentDist = 15;   // Jarak sensor ke air awal 15cm (Tandon cukup penuh)
let isPumpActive = false;

// Fungsi Utama: Mengatur UI dan Grafik
function updateUI(dist, soil) {
    // 1. Update Ultrasonik (Asumsi tinggi maksimal tandon 50cm)
    document.getElementById('dist-val').innerText = dist.toFixed(1);
    const waterLevel = Math.max(0, Math.min(100, 100 - (dist * 2))); 
    document.getElementById('water-level').style.height = waterLevel + "%";

    // 2. Update Soil Moisture
    document.getElementById('soil-val').innerText = soil.toFixed(0);
    const statusEl = document.getElementById('soil-status');
    const soilProgress = document.getElementById('soil-progress');
    
    // 3. Logika UI berdasarkan aktuator (Pompa)
    const pumpIcon = document.getElementById('pump-icon');
    const pumpText = document.getElementById('pump-text');
    
    if (isPumpActive) {
        statusEl.innerText = "KERING - Menyiram...";
        statusEl.style.color = "#dc3545"; 
        soilProgress.style.borderTopColor = "#dc3545";
        
        pumpIcon.classList.add('active');
        pumpIcon.innerHTML = "ON";
        pumpText.innerText = "Pompa Menyala (Penyiraman)";
        pumpText.style.color = "#28a745"; 
    } else {
        if (soil <= 70) {
            statusEl.innerText = "IDEAL";
            statusEl.style.color = "#28a745"; 
            soilProgress.style.borderTopColor = "#28a745";
        } else {
            statusEl.innerText = "BASAH";
            statusEl.style.color = "#007bff"; 
            soilProgress.style.borderTopColor = "#007bff";
        }
        
        pumpIcon.classList.remove('active');
        pumpIcon.innerHTML = "OFF";
        pumpText.innerText = "Pompa Mati / Standby";
        pumpText.style.color = "#666";
    }

    // 4. Update Grafik Historis
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (historyChart.data.labels.length > 15) { // Simpan 15 data terakhir di grafik
        historyChart.data.labels.shift();
        historyChart.data.datasets[0].data.shift();
        historyChart.data.datasets[1].data.shift();
    }
    historyChart.data.labels.push(now);
    historyChart.data.datasets[0].data.push(dist);
    historyChart.data.datasets[1].data.push(soil);
    historyChart.update();
}

// === FUNGSI GENERATOR DATA DUMMY DINAMIS ===
function generateRealisticDummyData() {
    if (isPumpActive) {
        // POMPA MENYALA: Tanah basah dengan cepat, Air tandon berkurang
        currentSoil += (Math.random() * 4 + 2); // Naik 2-6% per detik
        currentDist += (Math.random() * 0.5 + 0.1); // Jarak ultrasonik bertambah 0.1-0.6 cm
        
        // Cek jika tanah sudah basah (misal > 85%), matikan pompa
        if (currentSoil >= 85) {
            isPumpActive = false;
        }
    } else {
        // POMPA MATI: Tanah mengering secara perlahan
        currentSoil -= (Math.random() * 1.5 + 0.5); // Turun 0.5-2% per detik
        
        // Cek jika tanah terlalu kering (misal < 30%), nyalakan pompa
        if (currentSoil <= 30) {
            isPumpActive = true;
        }
    }

    // Pembatasan agar nilai tetap realistis dan tidak bablas
    currentSoil = Math.max(0, Math.min(100, currentSoil));
    currentDist = Math.max(5, Math.min(50, currentDist)); 

    // Update tampilan
    updateUI(currentDist, currentSoil);
}

// Jalankan generator data setiap 1 detik untuk melihat perubahannya
setInterval(generateRealisticDummyData, 1000);