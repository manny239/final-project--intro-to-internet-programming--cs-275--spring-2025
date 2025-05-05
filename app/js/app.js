// grab the sliding box
const boxElement = document.getElementById(`diamond-container`);

// --- create the control panel ---
const controls = document.createElement(`div`);
controls.id = `controls`;

// count display
const countDisplay = document.createElement(`span`);
countDisplay.id = `count-display`;
controls.appendChild(countDisplay);

// speed display
const speedDisplay = document.createElement(`span`);
speedDisplay.id = `speed-display`;
controls.appendChild(speedDisplay);

// single toggle button to pause and start the slider
const toggleButton = document.createElement(`button`);
toggleButton.id = `toggle-button`;
toggleButton.textContent = `Pause`;    // initial state: slider will start running
controls.appendChild(toggleButton);

// add controls to the page
document.body.appendChild(controls);

// Asking the user for the diamond size
const getDiamondSize = () => {
    let num, ok = false;
    while (!ok) {
        num = parseInt(
            prompt(`Please type the diamond’s size (a positive number between 2-100):`),
            10
        );
        if (!isNaN(num) && num > 0) ok = true;
        else alert(`Oops—that’s not valid. Try again.`);
    }
    return num;
};

// drawing the diamond shape
const drawDiamond = (size) => {
    boxElement.innerHTML = ``;        // clear old
    boxElement.style.padding = `0`;

    // show count in the display
    countDisplay.textContent = `Count: ${size}`;

    const isEven      = size % 2 === 0;
    const gapWidth    = isEven ? 4  : 2;
    const iconMargin  = isEven ? 10 : 5;
    const lineHeight  = isEven ? 16 : 4;
    const totalLines  = isEven ? size + 1 : size;
    const midLine     = Math.floor(totalLines / 2);

    for (let line = 0; line < totalLines; line++) {
        let rowDiv = document.createElement(`div`);
        rowDiv.classList.add(`row`);

        // space below each row except last
        if (line < totalLines - 1) {
            rowDiv.style.marginBottom = `${lineHeight}px`;
        }

        // how many diamonds this line
        const dist = Math.abs(midLine - line);
        let count = isEven && dist === midLine
            ? 1
            : size - dist * 2;

        // padding gaps on each side
        const sideGaps = midLine - Math.floor(count / 2);
        for (let p = 0; p < sideGaps; p++) {
            let g = document.createElement(`span`);
            g.classList.add(`space`);
            g.style.width = `${gapWidth}px`;
            rowDiv.appendChild(g);
        }

        // the custom added diamond icons + inner gaps
        for (let i = 0; i < count; i++) {
            let icon = document.createElement(`span`);
            icon.classList.add(`star`);
            icon.textContent = `◆`;
            icon.style.marginRight = `${iconMargin}px`;
            rowDiv.appendChild(icon);

            if (i < count - 1) {
                let g = document.createElement(`span`);
                g.classList.add(`space`);
                g.style.width = `${gapWidth}px`;
                rowDiv.appendChild(g);
            }
        }

        // right padding
        for (let p = 0; p < sideGaps; p++) {
            let g = document.createElement(`span`);
            g.classList.add(`space`);
            g.style.width = `${gapWidth}px`;
            rowDiv.appendChild(g);
        }

        boxElement.appendChild(rowDiv);
    }
};

// slider logic with pause/start ability
let slideInterval;
let slideDir = 1;
let slidePos = 0;

// NEW: dynamic step per tick inversely based on window width
let speedStep = 2;
let referenceWidth = window.innerWidth;
const updateSpeed = () => {
    // smaller window → larger speedStep; larger window → smaller speedStep
    speedStep = Math.max(1, Math.round(referenceWidth / window.innerWidth * 2));
    // convert to px per second: (px per tick) * (1000ms / tick interval)
    let pxPerSec = speedStep * (1000 / 5);
    speedDisplay.textContent = `Speed: ${pxPerSec} px/s`;
};
window.addEventListener(`resize`, updateSpeed);

// call once at start
updateSpeed();

const maxPos = () => window.innerWidth - boxElement.offsetWidth;

// start the slider
const startSlider = () => {
    // if already running, do nothing
    if (slideInterval !== undefined) return;
    toggleButton.textContent = `Pause`;
    slideInterval = setInterval(() => {
        let limit = maxPos();
        if (slidePos >= limit) slideDir = -1;
        else if (slidePos <= 0) slideDir = 1;
        slidePos += slideDir * speedStep;   // use dynamic speedStep
        boxElement.style.left = `${slidePos}px`;
    }, 5);
};

// pause the slider
const pauseSlider = () => {
    if (slideInterval !== undefined) {
        clearInterval(slideInterval);
        slideInterval = undefined;
        toggleButton.textContent = `Start`;
    }
};

// wire up the toggle
toggleButton.addEventListener(`click`, () => {
    if (slideInterval !== undefined) pauseSlider();
    else startSlider();
});

// initialize everything
const startDemo = () => {
    const n = getDiamondSize();
    drawDiamond(n);
    startSlider();
};

startDemo();
