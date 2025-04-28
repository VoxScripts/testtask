document.addEventListener('DOMContentLoaded', () => {
    const fullPath = window.location.pathname;
    const activePage = fullPath.substring(fullPath.lastIndexOf('/') + 1) || 'index.html'; // fallback

    const navLinks = document.querySelectorAll('nav li a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        const linkPage = linkPath.substring(linkPath.lastIndexOf('/') + 1);
        if (linkPage === activePage) {
            link.classList.add('active');
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const tocList = document.getElementById("toc-list");
    const headings = document.querySelectorAll("main h1, main h2");
    const hrElements = document.querySelectorAll("main hr");
    let lastMainLi = null;

    const hrPositions = Array.from(hrElements).map(hr => hr.offsetTop);
    const tocMap = {};

    headings.forEach(heading => {
        const id = heading.id;
        const text = heading.textContent;
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${id}`;
        a.textContent = text;
        li.appendChild(a);

        if (heading.tagName === "H1") {
            tocList.appendChild(li);
            lastMainLi = li;
            tocMap[id] = { h1: li, h2s: [] };
        } else if (heading.tagName === "H2" && lastMainLi) {
            let subList = lastMainLi.querySelector("ul.subheadings");
            if (!subList) {
                subList = document.createElement("ul");
                subList.classList.add("subheadings");
                subList.style.display = "none";
                lastMainLi.appendChild(subList);
            }
            subList.appendChild(li);
            const h1Id = lastMainLi.querySelector("a").getAttribute("href").substring(1);
            tocMap[h1Id].h2s.push(id);
        }
    });

    function clearTOC() {
        tocList.querySelectorAll("a").forEach(link => link.classList.remove("active"));
    }

    function showSubList(h1Id) {
        const h1Link = tocList.querySelector(`a[href="#${h1Id}"]`);
        const h1Li = h1Link?.closest("li");
        const subList = h1Li?.querySelector("ul.subheadings");
        if (subList) subList.style.display = "block";
    }

    function hideAllSubLists(exceptId = null) {
        tocList.querySelectorAll("ul.subheadings").forEach(ul => {
            if (!exceptId || !ul.closest("li")?.querySelector(`a[href="#${exceptId}"]`)) {
                ul.style.display = "none";
            }
        });
    }

    function activateTOC(h1Id, h2Id = null) {
        clearTOC();
        hideAllSubLists(h1Id);

        const h1Link = tocList.querySelector(`a[href="#${h1Id}"]`);
        if (h1Link) h1Link.classList.add("active");

        const h1Li = h1Link?.closest("li");
        const subList = h1Li?.querySelector("ul.subheadings");
        if (subList) subList.style.display = "block";

        if (h2Id) {
            const h2Link = tocList.querySelector(`a[href="#${h2Id}"]`);
            if (h2Link) h2Link.classList.add("active");
        } else if (tocMap[h1Id]?.h2s?.length) {
            const firstH2Id = tocMap[h1Id].h2s[0];
            const firstH2Link = tocList.querySelector(`a[href="#${firstH2Id}"]`);
            if (firstH2Link) firstH2Link.classList.add("active");
        }
    }

    function getNextH2(h1) {
        let el = h1.nextElementSibling;
        while (el) {
            if (el.tagName === "H2") return el;
            if (el.tagName === "H1") return null;
            el = el.nextElementSibling;
        }
        return null;
    }

    function getParentH1(h2) {
        let el = h2.previousElementSibling;
        while (el) {
            if (el.tagName === "H1") return el;
            el = el.previousElementSibling;
        }
        // Fallback: use offsetTop comparison
        return Array.from(document.querySelectorAll("main h1"))
            .reverse()
            .find(h1 => h1.offsetTop < h2.offsetTop);
    }

    let currentMain = null;

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(entry => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    
        if (visible.length > 0) {
            const entry = visible[0];
            const heading = entry.target;
    
            if (heading.tagName === "H2") {
                const parentH1 = getParentH1(heading);
                currentMain = parentH1 || currentMain;
                if (currentMain) {
                    activateTOC(currentMain.id, heading.id);
                }
            } else if (heading.tagName === "H1") {
                currentMain = heading;
                const headingName = currentMain.textContent.trim().toLowerCase();
                const pastHr = hrPositions.find(pos => currentMain.offsetTop < pos);
                const nextH2 = getNextH2(currentMain);
    
                const skipExpand = headingName === "features" && pastHr;
                if (skipExpand) {
                    activateTOC(currentMain.id, null);
                } else {
                    activateTOC(currentMain.id, nextH2?.id || null);
                }
            }
        }
    }, {
        threshold: [0.3], // Fire when 30% of the element is in the viewport
        rootMargin: '0px 0px -80% 0px' // Set a small bottom margin to prevent early activation
    });
    
    headings.forEach(h => observer.observe(h));

    tocList.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            e.preventDefault();
            const targetId = e.target.getAttribute("href").substring(1);
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            window.scrollTo({
                top: targetEl.offsetTop - 50,
                behavior: "smooth"
            });

            setTimeout(() => {
                if (targetEl.tagName === "H2") {
                    const parent = getParentH1(targetEl);
                    currentMain = parent;
                    activateTOC(currentMain?.id || null, targetEl.id);
                } else if (targetEl.tagName === "H1") {
                    currentMain = targetEl;
                    const headingName = currentMain.textContent.trim().toLowerCase();
                    const pastHr = hrPositions.find(pos => currentMain.offsetTop < pos);
                    const nextH2 = getNextH2(currentMain);

                    const skipExpand = headingName === "features" && pastHr;
                    if (skipExpand) {
                        activateTOC(currentMain.id, null);
                    } else {
                        activateTOC(currentMain.id, nextH2?.id || null);
                    }
                }
            }, 1000);
        }
    });

    // Initial activation on load
    const firstH1 = document.querySelector("main h1");
    if (firstH1) {
        currentMain = firstH1;
        const nextH2 = getNextH2(firstH1);
        activateTOC(firstH1.id, nextH2?.id || null);
    }
});
