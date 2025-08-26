const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const RULES_FILE = path.join(__dirname, 'business-rules.json');

function loadRules() {
  if (fs.existsSync(RULES_FILE)) {
    return JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
  }
  return { rules: [] };
}

function saveRules(rules) {
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/rules', (req, res) => {
  const rules = loadRules();
  res.json(rules);
});

app.post('/api/rules', (req, res) => {
  const newRule = req.body;
  const rules = loadRules();
  
  newRule.id = `BR-${String(rules.rules.length + 1).padStart(3, '0')}`;
  newRule.created = new Date().toISOString();
  
  rules.rules.push(newRule);
  saveRules(rules);
  
  res.json({ success: true, rule: newRule });
});

app.put('/api/rules/:id', (req, res) => {
  const ruleId = req.params.id;
  const updatedRule = req.body;
  const rules = loadRules();
  
  const index = rules.rules.findIndex(r => r.id === ruleId);
  if (index !== -1) {
    rules.rules[index] = { ...rules.rules[index], ...updatedRule };
    saveRules(rules);
    res.json({ success: true, rule: rules.rules[index] });
  } else {
    res.status(404).json({ success: false, message: 'Rule not found' });
  }
});

app.delete('/api/rules/:id', (req, res) => {
  const ruleId = req.params.id;
  const rules = loadRules();
  
  const index = rules.rules.findIndex(r => r.id === ruleId);
  if (index !== -1) {
    rules.rules.splice(index, 1);
    saveRules(rules);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Rule not found' });
  }
});

app.post('/api/export', (req, res) => {
  const rules = loadRules();
  const outputPath = path.join(__dirname, '../../..', 'outputs', 'stage1', 'business-rules.json');
  
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(rules, null, 2));
  
  res.json({ 
    success: true, 
    message: 'Rules exported to pipeline',
    path: outputPath
  });
});

app.listen(PORT, () => {
  console.log(`Rule Collection UI running at http://localhost:${PORT}`);
});