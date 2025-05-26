// 预定义用户数据
const validUsers = [
    { username: 'admin', password: '123456' },
    { username: 'user1', password: 'lab2023' }
];

// 登录功能
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('errorMessage');
    
    // 验证用户
    const isValidUser = validUsers.some(user => 
        user.username === username && user.password === password
    );
    
    if (isValidUser) {
        // 保存登录状态
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // 跳转到主页面
        window.location.href = 'home.html';
    } else {
        errorElement.textContent = '❌ 用户名或密码错误';
    }
});