const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Файл для хранения данных
const DATA_FILE = path.join(__dirname, 'data.json');

// Загрузка данных из файла
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) { console.error('Ошибка загрузки:', e); }
    return getDefaultData();
}

// Сохранение данных в файл
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Данные по умолчанию
function getDefaultData() {
    return {
        maleGroups: [
            { name: "Мужчины · Группа A", players: ["Иванов", "Петров", "Сидоров"], scores: [["", "", ""], ["", "", ""], ["", "", ""]] },
            { name: "Мужчины · Группа B", players: ["Козлов", "Морозов", "Волков"], scores: [["", "", ""], ["", "", ""], ["", "", ""]] }
        ],
        femaleGroups: [
            { name: "Женщины · Группа A", players: ["Смирнова", "Кузнецова", "Васильева"], scores: [["", "", ""], ["", "", ""], ["", "", ""]] }
        ],
        maleBracketStages: [
            { name: "Четвертьфиналы", matches: [] },
            { name: "Полуфиналы", matches: [] },
            { name: "Финал / Матч за 3 место", matches: [] }
        ],
        femaleBracketStages: [
            { name: "Четвертьфиналы", matches: [] },
            { name: "Полуфиналы", matches: [] },
            { name: "Финал / Матч за 3 место", matches: [] }
        ],
        lastUpdate: new Date().toLocaleString()
    };
}

let currentData = loadData();

// API для получения данных
app.get('/api/data', (req, res) => {
    res.json(currentData);
});

// API для сохранения данных (только для админа)
app.post('/api/data', (req, res) => {
    const { password, data } = req.body;
    if (password !== 'BDMEPHI2026') {
        return res.status(403).json({ error: 'Неверный пароль' });
    }
    data.lastUpdate = new Date().toLocaleString();
    currentData = data;
    saveData(currentData);
    res.json({ success: true, lastUpdate: currentData.lastUpdate });
});

// API для сброса (админ)
app.post('/api/reset', (req, res) => {
    const { password } = req.body;
    if (password !== 'BDMEPHI2026') {
        return res.status(403).json({ error: 'Неверный пароль' });
    }
    currentData = getDefaultData();
    saveData(currentData);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
