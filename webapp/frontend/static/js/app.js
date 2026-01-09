// Peacock Ultimate Unlocker - Frontend JavaScript

// ============================================================================
// Toast Notification System
// ============================================================================

class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-4 text-gray-400 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }
}

const toast = new ToastManager();

// ============================================================================
// HTMX Event Listeners
// ============================================================================

document.addEventListener('htmx:afterRequest', function(event) {
    try {
        const response = JSON.parse(event.detail.xhr.response);
        
        if (response.status === 'success') {
            toast.success(response.message || 'Operation completed successfully!');
        } else if (response.status === 'error') {
            toast.error(response.message || 'Operation failed!');
        }
    } catch (e) {
        // Response might not be JSON
        console.log('Response:', event.detail.xhr.response);
    }
});

document.addEventListener('htmx:beforeRequest', function(event) {
    // Add loading state
    const target = event.detail.elt;
    if (target.tagName === 'BUTTON') {
        target.classList.add('opacity-75', 'cursor-wait');
    }
});

document.addEventListener('htmx:afterRequest', function(event) {
    // Remove loading state
    const target = event.detail.elt;
    if (target.tagName === 'BUTTON') {
        target.classList.remove('opacity-75', 'cursor-wait');
    }
});

// ============================================================================
// Search Functionality
// ============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-search with debounce
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value;
        if (query.length >= 2) {
            // Trigger HTMX search
            htmx.trigger('#search-form', 'submit');
        }
    }, 300));
}

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

document.addEventListener('keydown', function(e) {
    // Ctrl+K or Cmd+K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
    }
});

// ============================================================================
// Progress Bar Animation
// ============================================================================

function animateProgress(element, targetPercent, duration = 1000) {
    const fill = element.querySelector('.progress-fill');
    let start = null;
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const currentPercent = progress * targetPercent;
        
        fill.style.width = `${currentPercent}%`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// ============================================================================
// Item Selection (for batch operations)
// ============================================================================

class ItemSelector {
    constructor() {
        this.selected = new Set();
    }

    toggle(id) {
        if (this.selected.has(id)) {
            this.selected.delete(id);
        } else {
            this.selected.add(id);
        }
        this.updateUI();
    }

    selectAll(ids) {
        ids.forEach(id => this.selected.add(id));
        this.updateUI();
    }

    clear() {
        this.selected.clear();
        this.updateUI();
    }

    getSelected() {
        return Array.from(this.selected);
    }

    updateUI() {
        const count = this.selected.size;
        const counter = document.getElementById('selected-count');
        if (counter) {
            counter.textContent = count;
            counter.parentElement.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update checkboxes
        document.querySelectorAll('input[type="checkbox"][data-item-id]').forEach(cb => {
            cb.checked = this.selected.has(cb.dataset.itemId);
        });
    }
}

const selector = new ItemSelector();

// ============================================================================
// Confirmation Dialogs
// ============================================================================

function showConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal p-8">
            <h3 class="text-xl font-bold mb-4">Confirm Action</h3>
            <p class="text-gray-400 mb-6">${message}</p>
            <div class="flex justify-end space-x-4">
                <button onclick="this.closest('.modal-overlay').remove()" class="btn-secondary">
                    Cancel
                </button>
                <button onclick="confirmAction()" class="btn-primary">
                    Confirm
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    window.confirmAction = function() {
        onConfirm();
        overlay.remove();
        delete window.confirmAction;
    };
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// ============================================================================
// Copy to Clipboard
// ============================================================================

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        toast.success('Copied to clipboard!');
    }).catch(err => {
        toast.error('Failed to copy');
    });
}

// ============================================================================
// Initialize on DOM Load
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Peacock Ultimate Unlocker - Web UI Loaded');
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize tooltips (if you add a tooltip library later)
    
    // Add loading animation to initial page load
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Welcome toast
    setTimeout(() => {
        toast.info('Welcome to Peacock Ultimate Unlocker!');
    }, 500);
});

// ============================================================================
// Export global functions
// ============================================================================

window.toast = toast;
window.selector = selector;
window.showConfirm = showConfirm;
window.copyToClipboard = copyToClipboard;
window.animateProgress = animateProgress;
