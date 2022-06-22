function navbar() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {
        isFixed: true
    });

    let navbarOnScroll = document.getElementsByTagName('nav')[0];
    window.onscroll = function () {
        let y = window.scrollY;
        if (y == 0) {
            navbarOnScroll.classList.add('z-depth-0');
        }
        else {
            navbarOnScroll.classList.remove('z-depth-0');
        }
    };


    // Tooltips
    let tooltipped = document.querySelectorAll('.tooltipped');
    let tooltippeds = M.Tooltip.init(tooltipped, {});
}