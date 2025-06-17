// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    let lastScroll = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // 向下滚动
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // 向上滚动
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 添加页面切换动画
    const pageTransitions = () => {
        const links = document.querySelectorAll('a:not([href^="#"])');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                document.body.classList.add('page-transition');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            });
        });
    };

    pageTransitions();
}); 