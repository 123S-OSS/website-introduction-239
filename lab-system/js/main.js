// 药品数据存储
let chemicals = JSON.parse(localStorage.getItem('chemicals')) || {
    "NaCl": {
        name: "氯化钠",
        dangerous: false,
        quantity: 500,
        count: 2,
        location: "危化柜",
        molarMass: 58.44
    }
};
// 使用记录数据
let usageRecords = JSON.parse(localStorage.getItem('usageRecords')) || [];

// 页面切换
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active-section');
    });
    document.getElementById(sectionId).classList.add('active-section');
}

// 药品管理功能
function addNewChemical(e) {
    e.preventDefault();
    const chem = {
        name: document.getElementById('chemName').value,
        dangerous: document.getElementById('isDangerous').checked,
        quantity: parseFloat(document.getElementById('chemQuantity').value),
        count: parseInt(document.getElementById('chemCount').value),
        location: document.getElementById('chemLocation').value
    };
    
    chemicals[chem.name] = chem;
    localStorage.setItem('chemicals', JSON.stringify(chemicals));
    alert(`✅ 成功添加 ${chem.name}`);
    e.target.reset();
    searchChemical('');
}

function searchChemical(keyword) {
    const results = Object.values(chemicals).filter(chem => 
        chem.name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    let html = results.map(chem => `
        <div class="chemical-item">
            <h3>${chem.name} ${chem.dangerous ? '⚠️' : ''}</h3>
            <p>📦 数量: ${chem.quantity} ${chem.quantity > 1000 ? 'kg' : 'g'}</p>
            <p>📎 件数: ${chem.count}</p>
            <p>📍 位置: ${chem.location}</p>
        </div>
    `).join('');
    
    document.getElementById('searchResults').innerHTML = html || 
        '<p style="text-align:center">🔍 未找到相关药品</p>';
}

// 计算器功能
function changeCalculatorType(type) {
    document.querySelectorAll('.calculator-type').forEach(el => 
        el.classList.remove('active')
    );
    event.target.classList.add('active');
    
    document.getElementById('solidCalculator').style.display = 
        type === 'solid' ? 'grid' : 'none';
    document.getElementById('liquidCalculator').style.display = 
        type === 'liquid' ? 'grid' : 'none';
}

function calculateSolid() {
    const conc = parseFloat(document.getElementById('targetConcentration').value);
    const vol = parseFloat(document.getElementById('targetVolume').value);
    const molarMass = parseFloat(document.getElementById('molarMass').value);
    
    if (conc && vol && molarMass) {
        const mass = conc * vol * molarMass;
        showResult(`需要称取：${mass.toFixed(2)} g 
            <button onclick="searchChemical('')">🔍 查看库存</button>`);
    }
}

function calculateLiquid() {
    const C1 = parseFloat(document.getElementById('stockConcentration').value);
    const C2 = parseFloat(document.getElementById('liquidConcentration').value);
    const V2 = parseFloat(document.getElementById('liquidVolume').value);
    
    if (C1 && C2 && V2) {
        const V1 = (C2 * V2) / C1;
        showResult(`需要取母液：${V1.toFixed(4)} L (${(V1*1000).toFixed(2)} mL)
            <button onclick="searchChemical('')">🔍 查看库存</button>`);
    }
}

function showResult(text) {
    document.getElementById('result').innerHTML = text;
}

// 初始化搜索
window.onload = function() {
    searchChemical('');
};
// 填充药品下拉菜单
function populateChemicalSelect() {
    const select = document.getElementById('chemSelect');
    select.innerHTML = '<option value="">选择药品...</option>';
    
    Object.values(chemicals).forEach(chem => {
        const option = document.createElement('option');
        option.value = chem.name;
        option.textContent = `${chem.name} (剩余: ${chem.quantity}${chem.quantity > 1000 ? 'kg' : 'g'})`;
        select.appendChild(option);
    });
}

// 登记使用记录
document.getElementById('usageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const chemName = document.getElementById('chemSelect').value;
    const amount = parseFloat(document.getElementById('usageAmount').value);
    const user = document.getElementById('userName').value.trim();
    const purpose = document.getElementById('usagePurpose').value.trim();
    const date = document.getElementById('usageDate').value || new Date().toISOString().slice(0, 10);
    
    if (!chemicals[chemName]) {
        alert('请选择有效药品！');
        return;
    }
    
    if (chemicals[chemName].quantity < amount) {
        alert(`❌ 库存不足！当前剩余: ${chemicals[chemName].quantity}${chemicals[chemName].quantity > 1000 ? 'kg' : 'g'}`);
        return;
    }
    
    // 更新库存
    chemicals[chemName].quantity = parseFloat((chemicals[chemName].quantity - amount).toFixed(2));
    localStorage.setItem('chemicals', JSON.stringify(chemicals));
    
    // 添加记录
    const record = {
        id: Date.now(),
        chemName,
        amount,
        user,
        purpose,
        date,
        remaining: chemicals[chemName].quantity
    };
    usageRecords.push(record);
    localStorage.setItem('usageRecords', JSON.stringify(usageRecords));
    
    // 刷新显示
    displayUsageRecords();
    populateChemicalSelect(); // 更新下拉菜单
    searchChemical(''); // 刷新药品列表
    this.reset(); // 清空表单
});

// 显示使用记录
function displayUsageRecords() {
    const container = document.getElementById('usageRecords');
    container.innerHTML = usageRecords.length === 0 ? 
        '<p style="text-align:center;color:#777;">暂无使用记录</p>' : '';
    
    usageRecords.slice().reverse().forEach(record => {
        const item = document.createElement('div');
        item.className = 'record-item';
        item.innerHTML = `
            <p><strong>${record.chemName}</strong> - 使用量: ${record.amount}${record.amount > 1000 ? 'kg' : 'g'}</p>
            <p>使用人: ${record.user} | 用途: ${record.purpose}</p>
            <p>日期: ${record.date} | 剩余: ${record.remaining}${record.remaining > 1000 ? 'kg' : 'g'}</p>
            <small>记录ID: ${record.id}</small>
        `;
        container.appendChild(item);
    });
}

// 打印功能
document.getElementById('printBtn').addEventListener('click', function() {
    if (usageRecords.length === 0) {
        alert('没有可打印的记录！');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>药品使用记录</title>
            <style>
                body { font-family: Arial; margin: 15mm; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>药品使用记录表</h1>
                <p>打印时间: ${new Date().toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>药品名称</th>
                        <th>使用量</th>
                        <th>使用人</th>
                        <th>用途</th>
                        <th>使用日期</th>
                        <th>剩余量</th>
                    </tr>
                </thead>
                <tbody>
                    ${usageRecords.map(record => `
                        <tr>
                            <td>${record.chemName}</td>
                            <td>${record.amount}${record.amount > 1000 ? 'kg' : 'g'}</td>
                            <td>${record.user}</td>
                            <td>${record.purpose}</td>
                            <td>${record.date}</td>
                            <td>${record.remaining}${record.remaining > 1000 ? 'kg' : 'g'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 300);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
});

// 初始化
window.onload = function() {
    searchChemical('');
    populateChemicalSelect();
    displayUsageRecords();
    document.getElementById('usageDate').valueAsDate = new Date();
};