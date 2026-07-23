import { App, Plugin, MarkdownView, setIcon, PluginSettingTab, Setting } from 'obsidian';

// --- 1. SETTINGS INTERFACE & DEFAULTS ---
interface ChatboxSettings {
    roles: string;
}

const DEFAULT_SETTINGS: ChatboxSettings = {
    roles: 'me, voice in my head, chaos'
}

export default class MyPlugin extends Plugin {
    settings: ChatboxSettings;
    floatingContainer: HTMLElement;
    dropdown: HTMLSelectElement; // Lifted to class level so settings can update it
    isInputVisible: boolean = true;

    // --- DRAG STATE VARIABLES ---
    isDragging: boolean = false;
    longPressTimer: NodeJS.Timeout | null = null;
    startX: number = 0;
    startY: number = 0;
    initialLeft: number = 0;
    initialTop: number = 0;

    // --- GLOBAL EVENT HANDLERS ---
    handleTouchMove = (e: TouchEvent) => {
        if (!this.isDragging) return;
        e.preventDefault(); 
        const deltaY = e.touches[0].clientY - this.startY;
        this.floatingContainer.style.top = `${this.initialTop + deltaY}px`;
    };

    handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;
        const deltaY = e.clientY - this.startY;
        this.floatingContainer.style.top = `${this.initialTop + deltaY}px`;
    };

    stopDrag = () => {
        if (this.longPressTimer) clearTimeout(this.longPressTimer);
        if (this.isDragging) {
            this.isDragging = false;
            this.floatingContainer.removeClass('is-dragging');
        }
    };

    async onload() {
        // Load settings first!
        await this.loadSettings();

        // Register the settings tab so it shows up in Obsidian's menu
        this.addSettingTab(new ChatboxSettingTab(this.app, this));

        // 1. Create the floating container
        this.floatingContainer = document.body.createEl('div', {
            cls: 'chatbox-floating-container'
        });

        // Create the grab handle
        const dragHandle = this.floatingContainer.createEl('div', {
            cls: 'chatbox-drag-handle'
        });

        // 2. Create the Dropdown
        this.dropdown = this.floatingContainer.createEl('select', {
            cls: 'chatbox-dropdown'
        });
        this.updateDropdown(); // Populate based on loaded settings

        // 3. Create the text input
        const inputField = this.floatingContainer.createEl('input', {
            type: 'text',
            placeholder: 'Type a message...',
            cls: 'chatbox-input'
        });

        // 4. Create the Send button with an icon
        const sendButton = this.floatingContainer.createEl('button', {
            cls: 'chatbox-send-button',
            attr: { 'aria-label': 'Send message' }
        });
        setIcon(sendButton, 'send'); 

        // 5. Create the Scroll button with an icon
        const scrollButton = this.floatingContainer.createEl('button', {
            cls: 'chatbox-icon-button chatbox-scroll-button', 
            attr: { 'aria-label': 'Scroll to bottom' }
        });
        setIcon(scrollButton, 'arrow-down'); 

        // --- DRAG LOGIC ---
        const startDrag = (clientX: number, clientY: number) => {
            this.isDragging = true;
            this.floatingContainer.addClass('is-dragging');

            const rect = this.floatingContainer.getBoundingClientRect();
            
            this.floatingContainer.style.bottom = 'auto';
            this.floatingContainer.style.transform = 'none';
            this.floatingContainer.style.left = `${rect.left}px`;
            this.floatingContainer.style.top = `${rect.top}px`;

            this.startX = clientX;
            this.startY = clientY;
            this.initialLeft = rect.left;
            this.initialTop = rect.top;
        };

        const handleInteractStart = (clientX: number, clientY: number, target: EventTarget | null) => {
            if (target instanceof HTMLInputElement || target instanceof HTMLButtonElement || target instanceof HTMLSelectElement) return;

            this.longPressTimer = setTimeout(() => {
                startDrag(clientX, clientY);
            }, 400);
        };

        this.floatingContainer.addEventListener('touchstart', (e) => {
            handleInteractStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
        }, { passive: true });

        this.floatingContainer.addEventListener('touchmove', () => {
            if (!this.isDragging && this.longPressTimer) clearTimeout(this.longPressTimer);
        }, { passive: true });

        this.floatingContainer.addEventListener('mousedown', (e) => {
            handleInteractStart(e.clientX, e.clientY, e.target);
        });

        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.stopDrag);
        document.addEventListener('touchcancel', this.stopDrag);
        
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.stopDrag);

        // --- MOBILE-FRIENDLY TOGGLES ---
        this.addRibbonIcon('message-circle', 'Toggle Chat', () => {
            this.isInputVisible = !this.isInputVisible;
            this.floatingContainer.style.display = this.isInputVisible ? 'flex' : 'none';
        });

        this.addCommand({
            id: 'toggle-chat-interface',
            name: 'Toggle Chat',
            callback: () => {
                this.isInputVisible = !this.isInputVisible;
                this.floatingContainer.style.display = this.isInputVisible ? 'flex' : 'none';
                
                if (this.isInputVisible) {
                    statusBarItem.setText('💬 Chat: ON');
                } else {
                    statusBarItem.setText('💬 Chat: OFF');
                }
            }
        });

        // --- PURE SCROLL LOGIC ---
        const scrollToBottom = () => {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!activeView) return;

            if (activeView.getMode() === 'preview') {
                const previewContainer = activeView.contentEl.querySelector('.markdown-preview-view');
                if (previewContainer) {
                    previewContainer.scrollTop = previewContainer.scrollHeight;
                }
            } else if (activeView.getMode() === 'source') {
                const editContainer = activeView.contentEl.querySelector('.cm-scroller');
                if (editContainer) {
                    editContainer.scrollTop = editContainer.scrollHeight;
                }
            }
        };

        scrollButton.addEventListener('click', scrollToBottom);

        inputField.addEventListener('focus', () => {
            scrollToBottom();
            this.floatingContainer.addClass('keyboard-open');
        });

        inputField.addEventListener('blur', () => {
            this.floatingContainer.removeClass('keyboard-open');
        });

        // --- SEND LOGIC ---
        const handleSend = () => {
            const text = inputField.value.trim();
            if (!text) return; 
            
            const selectedRole = this.dropdown.value; 

            // Timestamp Generator
            const getFormattedTime = () => {
                const now = new Date();
                
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                
                const date = now.getDate();
                const suffix = ["th", "st", "nd", "rd"][
                    (date % 100 > 10 && date % 100 < 20) ? 0 : (date % 10 < 4 ? date % 10 : 0)
                ];
                
                const month = now.toLocaleString('en-US', { month: 'short' });
                const year = now.getFullYear().toString().slice(-2);
                
                return `${hours}:${minutes} ${date}${suffix} ${month},${year}`;
            };

            const timestamp = getFormattedTime();

            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (!activeView) {
                console.warn('No active Markdown view found!');
                return;
            }

            const editor = activeView.editor;
            
            editor.replaceSelection('{{' + selectedRole + '|' + text + '|' + timestamp + '}}\n');
            inputField.value = ''; 
            
            setTimeout(() => {
                scrollToBottom();
            }, 50);
        };

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        sendButton.addEventListener('click', () => {
            handleSend();
        });

        // --- STATUS BAR TOGGLE ---
        const statusBarItem = this.addStatusBarItem();
        statusBarItem.setText('💬 Chat: ON');
        statusBarItem.addClass('mod-clickable'); 

        statusBarItem.onClickEvent(() => {
            this.isInputVisible = !this.isInputVisible;
            if (this.isInputVisible) {
                this.floatingContainer.style.display = 'flex';
                statusBarItem.setText('💬 Chat: ON');
            } else {
                this.floatingContainer.style.display = 'none';
                statusBarItem.setText('💬 Chat: OFF');
            }
        });
    }

    onunload() {
        if (this.floatingContainer) {
            this.floatingContainer.remove();
        }

        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.stopDrag);
        document.removeEventListener('touchcancel', this.stopDrag);
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.stopDrag);
    }

    // --- 2. LOAD/SAVE METHODS ---
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateDropdown(); // Refresh the UI immediately when saved
    }

    // --- HELPER: UPDATE DROPDOWN ---
    updateDropdown() {
        this.dropdown.empty(); // Clear old options
        // Split by comma, trim whitespace, and ignore empty entries
        const roles = this.settings.roles.split(',').map(r => r.trim()).filter(r => r !== '');
        
        // Failsafe in case they delete everything
        if (roles.length === 0) roles.push('user'); 
        
        roles.forEach(opt => {
            this.dropdown.createEl('option', { value: opt, text: opt });
        });
    }
}

// --- 3. SETTINGS TAB CLASS ---
class ChatboxSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Custom Roles')
            .setDesc('Enter your chat roles, separated by commas.')
            .addTextArea(text => text
                .setPlaceholder('me, voice in my head, chaos')
                .setValue(this.plugin.settings.roles)
                .onChange(async (value) => {
                    this.plugin.settings.roles = value;
                    await this.plugin.saveSettings();
                }));
    }
}