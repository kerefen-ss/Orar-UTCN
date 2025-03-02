document.addEventListener("DOMContentLoaded", function () {
    const ore = [
        "08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"
    ];

    const saptamani = {
        impar: [
            { start: "2025-02-24", end: "2025-03-02" },
            { start: "2025-03-10", end: "2025-03-16" },
            { start: "2025-03-24", end: "2025-03-30" },
            { start: "2025-04-07", end: "2025-04-13" },
            { start: "2025-04-21", end: "2025-04-27" },
            { start: "2025-05-05", end: "2025-05-11" },
            { start: "2025-05-19", end: "2025-05-25" },
        ],
        par: [
            { start: "2025-03-03", end: "2025-03-09" },
            { start: "2025-03-17", end: "2025-03-23" },
            { start: "2025-03-31", end: "2025-04-06" },
            { start: "2025-04-14", end: "2025-04-20" },
            { start: "2025-04-28", end: "2025-05-04" },
            { start: "2025-05-12", end: "2025-05-18" },
            { start: "2025-05-26", end: "2025-06-01" },
        ]
    };

    const orare = {
        impar: [
            ["X", "X", "TRD C - D22", "ME I C - D22", "TSRA L - BT 3.03", "TSRA L - BT 3.03"],  
            ["TRD L - BT 3.04", "TRD L - BT 3.04", "UE C - D04", "TSRA C - D04", "X", "X"],          
            ["X", "TSRA S - BT 4.04", "X", "M C - P03", "RM C - D22", "SD C - D22"],                   
            ["X", "X", "X", "X", "X", "X"],                                                          
            ["X", "X", "X", "X", "X", "X"],
        ],
        par: [
            ["X", "X", "TRD C - D22", "ME I C - D22", "SD L - 106a", "SD L - 106a"],            
            ["X", "RM L - 366", "UE C - D04", "TSRA C - D04", "X", "M L - C304b"],                            
            ["X", "X", "X", "M C - P03", "RM C - D22", "SD C - D22"],                                 
            ["ME I L - ME", "ME I L - ME", "X", "X", "SD S - H21", "X"],                                                          
            ["X", "X", "EG C - P02", "FR C - D22", "X", "X"],
        ]
    };

    let esteSaptamanaViitoare = false;
    let saptamanaCurenta = verificaSaptamana();
    afiseazaOrarul(saptamanaCurenta, false);

    document.getElementById("toggle-week").addEventListener("click", function () {
        esteSaptamanaViitoare = !esteSaptamanaViitoare;
        afiseazaOrarul(saptamanaCurenta, esteSaptamanaViitoare);
    });

    function verificaSaptamana() {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Verificăm săptămâna curentă
        for (let i = 0; i < saptamani.impar.length; i++) {
            let start = new Date(saptamani.impar[i].start);
            let end = new Date(saptamani.impar[i].end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            if (currentDate >= start && currentDate <= end) return "impar";
        }

        // Dacă nu s-a găsit în săptămânile impare, căutăm în săptămânile pare
        return "par";
    }

    function afiseazaOrarul(saptamana, viitoare) {
        const tbody = document.getElementById("orar-body");
        tbody.innerHTML = "";

        let orar = viitoare ? orare[saptamana === "impar" ? "par" : "impar"] : orare[saptamana];
        let weekData = viitoare ? saptamani[saptamana === "impar" ? "par" : "impar"] : saptamani[saptamana];

        let numarSaptamana = 1;
        let weekStart = "";
        let weekEnd = "";

        let currentDate = new Date();

        // Calculăm intervalul pentru săptămâna curentă și viitoare
        for (let i = 0; i < weekData.length; i++) {
            let start = new Date(weekData[i].start);
            let end = new Date(weekData[i].end);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            if (viitoare && currentDate < start) {
                weekStart = formatDate(start);
                weekEnd = formatDate(end);
                break;
            }

            if (!viitoare && currentDate >= start && currentDate <= end) {
                numarSaptamana = i + 1;
                weekStart = formatDate(start);
                weekEnd = formatDate(end);
                break;
            }
        }

        let saptamanaText = viitoare ? "Săptămâna Viitoare" : `Săptămâna ${saptamana === "impar" ? "Impară" : "Pară"} - Săptămâna ${numarSaptamana}`;

        // Afișăm intervalul pentru săptămâna curentă
        document.getElementById("week-info").innerText = `${saptamanaText}\nInterval: ${weekStart} - ${weekEnd}`;

        // Generăm orarul
        for (let i = 0; i < ore.length; i++) {
            const tr = document.createElement("tr");
            const thOra = document.createElement("th");
            thOra.innerText = ore[i];
            tr.appendChild(thOra);

            for (let j = 0; j < 5; j++) {
                const td = document.createElement("td");
                td.innerText = orar[j][i] || "X";
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        // Save the timetable data to cache
        if (navigator.serviceWorker) {
            caches.open('orar-cache-v1').then((cache) => {
                cache.put('/orar.json', new Response(JSON.stringify({ orar, saptamani })));
            });
        }
    }

    // Funcția pentru a formata data în "zi/lună/an"
    function formatDate(date) {
        let day = date.getDate();
        let month = date.getMonth() + 1; // lunile sunt indexate de la 0
        let year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    }

    // Înregistrare Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('Service Worker înregistrat cu succes:', registration);
        }).catch(function(error) {
            console.log('Înregistrarea Service Worker a eșuat:', error);
        });
    }
});
