function init3DView() {
    const container = document.getElementById('3d-container');
    if (!container) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // 设置相机
    const camera = new THREE.PerspectiveCamera(
        75, 
        container.clientWidth / 300, 
        0.1, 
        1000
    );
    camera.position.z = 3;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 300);
    container.appendChild(renderer.domElement);

    // 添加立方体
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0x3a76f0 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 添加灯光
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

// 页面加载后初始化
window.addEventListener('load', init3DView);