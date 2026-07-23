# Chat View Messenger for Obsidian

A clean, mobile-friendly, floating chat interface for Obsidian, which uses the [Chat View plugin](https://github.com/adifyr/obsidian-chat-view) by [adifyr](https://github.com/adifyr) as a base.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/1491a7f5-d776-4298-8f23-71701c0d9baf" /> <img width="300" alt="WhatsApp Image 2026-07-23 at 21 27 20" src="https://github.com/user-attachments/assets/65a9e285-9a8e-4479-b792-975da329f9a4" />


This plugin allows you to use the power of the [Chat View plugin](https://github.com/adifyr/obsidian-chat-view) to quickly inject conversational notes, role-play dialogues, or internal monologues directly into your active Markdown file, but now with a chatbox interface, where you can choose roles, and just click send!

## ✨ Features

* **💬 Floating UI:** A persistent, draggable chatbox that hovers over your editor.
* **🎭 Custom Roles:** Easily switch between different perspectives (e.g., *Me, Voice in my head, Chaos*). You can customize this list in the plugin settings.
* **⏱️ Auto-Timestamps:** Automatically appends a formatted timestamp to every message (e.g., `19:37 23rd Jun,26`).
* **📱 Mobile Support:** Fully responsive design that respects the Android virtual keyboard, complete with a drag-and-drop handle so it never gets in your way. (Not tested on iPhone yet!).
* **⌨️ Quick Toggles:** Hide or show the chatbox via the Ribbon Icon, the Command Palette, or the Status Bar.

## 📝 How it Works
First up, you will need the [Chat View plugin](https://github.com/adifyr/obsidian-chat-view) for Obsidian.

After that, create a chat block using 
```text
	```chat

	```
```
Now, as required, create the roles/narrators as you wish, using the Chat View's formatting rules!

```text
	```chat
		(by default the text bubble is aligned left)
		>actor 1  ---> text bubble will be aligned right
		^actor 2  ---> text bubble in the middle
	```
```

Now with these roles defined, you can go to the plugin settings of Messenger and add the roles in the list, so that they show up on the dropdown.

### NOTE: Place your cursor where your conversation is to start. Its not needed everytime, but in case you reload a note, or the app, the cursor is set to the beginning by default, so it might need to be placed where you want it.

Select a role from the dropdown, type your message, and hit send (or press `Enter`). The plugin instantly injects the text into your active note using the following Chat View syntax:

```text
{{role|Your message here|HH:MM DDo Mon,YY}}
```

**Example Output:**

<img width="642" height="80" alt="image" src="https://github.com/user-attachments/assets/a0b37c7a-e2f3-40ed-a218-fbe498f37449" />

after sending, shows up as

<img width="269" height="119" alt="image" src="https://github.com/user-attachments/assets/5e464fa9-e235-4d4e-905f-16bf6be19bb2" />

## ⚙️ Settings

Go to **Settings > Chatbox Messenger** to customize your available roles. 
Enter your desired roles separated by commas (e.g., `User, Assistant, System, Narrator`). The dropdown menu in the floating chatbox will update instantly.

## 📥 Installation

Manual Installation
1. Download the latest release from the `Releases` section of this repository.
2. Extract the `main.js`, `manifest.json`, and `styles.css` files.
3. Place them inside a new folder in your vault's plugins directory: `VaultFolder/.obsidian/plugins/obsidian-chatbox-messenger/`.
4. Reload Obsidian and enable the plugin in your Community Plugins settings.

## 🖱️ Usage Tips

* **Desktop:** The chatbox floats at the bottom of your screen. Click the ribbon icon or use the command palette to toggle its visibility.
* **Mobile:** If the chatbox is blocking your text, simply **long-press** the background of the chatbox for half a second. It will detach, allowing you to drag it up or down the screen out of your way!

#### P.S. If you like the theme, I'm using [MatoTomato's](https://github.com/MatoTheTomato) [Elysian](https://github.com/matothetomato/Elysian), I love it!!
