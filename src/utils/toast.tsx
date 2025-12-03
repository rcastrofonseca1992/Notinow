// Simple toast notification utility

interface ToastOptions {
  icon?: string;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private getContainer(): HTMLDivElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show(message: string, options: ToastOptions = {}) {
    const container = this.getContainer();
    
    const toast = document.createElement('div');
    toast.className = 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300 pointer-events-auto';
    
    if (options.icon) {
      const icon = document.createElement('span');
      icon.textContent = options.icon;
      icon.className = 'text-lg';
      toast.appendChild(icon);
    }
    
    const text = document.createElement('span');
    text.textContent = message;
    text.className = 'text-sm';
    toast.appendChild(text);
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'fade-out 300ms ease-out';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, 3000);
  }

  success(message: string, options: ToastOptions = {}) {
    this.show(message, { icon: '✓', ...options });
  }

  error(message: string, options: ToastOptions = {}) {
    this.show(message, { icon: '✕', ...options });
  }
}

export const toast = new ToastManager();
