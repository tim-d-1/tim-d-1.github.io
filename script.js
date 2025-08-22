let draggedItem = null;
let clone = null;
let touchTimeout = null;
let isDragging = false;

const mobilePressThreshold = 150;

// Make a task draggable (desktop + touch)
function makeDraggable(task) {
    // Desktop drag
    task.setAttribute('draggable', true);
    task.addEventListener('dragstart', () => {
        draggedItem = task;
        task.classList.add('dragging');
    });
    task.addEventListener('dragend', () => {
        draggedItem = null;
        task.classList.remove('dragging');
    });

    // Mobile touch
    task.addEventListener('touchstart', (e) => {
        touchTimeout = setTimeout(() => {
            draggedItem = task;
            isDragging = true;

            clone = task.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.pointerEvents = 'none';
            clone.style.opacity = '0.7';
            clone.style.zIndex = '1000';
            document.body.appendChild(clone);

            moveClone(e.touches[0]);
        }, mobilePressThreshold);
    });

    task.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault(); // prevent scrolling only when possible
        moveClone(e.touches[0]);
    });

    task.addEventListener('touchend', (e) => {
        clearTimeout(touchTimeout);
        if (!isDragging) return;

        clone.remove();
        clone = null;

        const dropTarget = document.elementFromPoint(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
        )?.closest('section');

        if (dropTarget) {
            const afterElement = getDragAfterElement(dropTarget, e.changedTouches[0].clientY);
            if (!afterElement) dropTarget.appendChild(draggedItem);
            else dropTarget.insertBefore(draggedItem, afterElement);
        }

        draggedItem = null;
        isDragging = false;
    });

    // Cancel the timeout if the user lifts the finger before long-press
    task.addEventListener('touchcancel', () => {
        clearTimeout(touchTimeout);
        if (clone) clone.remove();
        clone = null;
        draggedItem = null;
        isDragging = false;
    });
}

// Move the floating clone
function moveClone(touch) {
    clone.style.left = touch.pageX - clone.offsetWidth / 2 + 'px';
    clone.style.top = touch.pageY - clone.offsetHeight / 2 + 'px';
}

// Get the task after the cursor for reordering
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Make existing tasks draggable
document.querySelectorAll('.task').forEach(makeDraggable);

// Sections drop logic for desktop
document.querySelectorAll('section').forEach(section => {
    section.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(section, e.clientY);
        if (!afterElement) section.appendChild(draggedItem);
        else section.insertBefore(draggedItem, afterElement);
    });
});

// Form submission to add a new task
document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('new-task');
    const value = input.value.trim();
    if (!value) return;

    const newTask = document.createElement('label');
    newTask.className = 'task';
    newTask.innerHTML = `
        <input type="checkbox">
        <div class="checkmark"></div>
        <span>${value}</span>
    `;

    makeDraggable(newTask);
    document.querySelector('section').appendChild(newTask);
    input.value = '';
});
