---
title: "RTL8710AF: Hello World"
publishdate: 2018-02-13T00:00:00Z
lastmod: 2018-02-13T00:00:00Z
description: "A brief rundown on updating the sample SDK project running on an RTL8710AF chip using the dev board and USB."
---

After doing a hackathon at my workplace a few weeks ago, I got a sudden urge
to try and deliver something using embedded hardware, as it's a space I never
play in (commercially), and is far removed from my day-to-day.

After having played with the ESP8266, I was emboldened to try something a
little meatier, so I ordered a few of the RTL8710AF boards to develop against,
reasoning that the ARM processor would be supported by Rust (my intended
development language), as it is a supported LLVM target.

Here's a brief foray on my first task: successfully flashing any executable to
the device's flash storage!

## Hardware

* 1x [RTL8710AF Wireless Dev Board](https://www.seeedstudio.com/Ameba-RTL8710AF-Wireless-Dev-Board-p-2804.html)
* 1x Dell XPS 9560, running Arch Linux
* 1x MicroUSB cable

## Requirements

*If you have a Linux install that isn't Arch Linux based, hopefully you can
deduce the needed packages for your system --- nothing here is very Arch Linux
specific.*

Arch Linux packages (`pacman`):

```text
base-devel lib32-glibc lib32-ncurses ncurses lib32-gcc-libs bc arm-none-eabi-binutils arm-none-eabi-gdb minicom bc gdb
```

*Arch specific:* Before installing the AUR packages, you need a signing key: [^fn:1]

```shell
$ gpg --keyserver keys.gnupg.net --recv-keys 702353E0F7E48EDB
```

Arch Linux AUR packages:

```text
openocd lib32-ncurses5-compat-libs ncurses5-compat-libs
```

You'll also need the **Ameba SDK**, which can be found behind a registration
wall at [the AmebaIOT site](https://www.amebaiot.com/en/ameba-sdk-download/).
I used `sdk-ameba-v4.0b_without_NDA_GCC_V1.0.0.zip` (Sdk Ameba V4.0b Without
NDA GCC V1.0.0) --- you may need to adjust some paths and steps if you use a
different version of the SDK. [^fn:2]

## Procedure

1. *Arch specific:* [^fn:3] Add your user to the `uucp` group, so you don't
    need root privileges [^fn:4] to access serial ports.

    ```bash
    $ sudo usermod -aG uucp "$(whoami)"
    $ su "$(whoami)"
    ```

1. Connect the `CON2` port on the dev board to a sufficiently-powered USB port.
1. Confirm the device is recognised and made available. [^fn:5]

    ```shell
    $ file /dev/ttyACM0
    /dev/ttyACM0: character special (166/0)
    $ picocom -b 38400 /dev/ttyACM0

    # help

    [MEM] After do cmd, available heap #####
    ```

    * Press `^A^X` (ctrl-A, ctrl-X) to exit `picocom`.

1. Check the version of the firmware as per the `mbed.htm` on the `mbed`
    device (which can be mounted from a `/dev/sdX` device if needed).

    ```html
    <!-- Ameba DAP -->
    <!-- Version: v12.1.2 Build: Oct 27 2017 14:46:30 -->
    ```

1. If the version is older than `v10.2.3`, you will need to
    [update the DAP firmware](https://www.amebaiot.com/en/change-dap-firmware/).
    (I used `DAP_FW_Ameba_V12_1_2-2M.bin`).

    1. Remove the device, if connected.
    1. Connect the board, hold the button next to `CON2` on the dev board, then
        press the button next to CON1.
    1. When the new `CRP DISABLED` device appears, backup the existing firmware
        (`firmware.bin` on the device)
    1. Install the new firmware. [^fn:6]

    ```bash
    $ sudo dd if=/home/liamdawson/Downloads/DAP_FW_Ameba_V12_1_2-2M.bin of=/dev/disk/by-label/CRP\\x20DISABLD bs=512 seek=4
    ```

1. Unpack the Ameba SDK, and go into the `project/realtek_ameba1_va0_example/GCC-RELEASE` folder
1. Setup the OpenOCD protocol as the communication method.

    ```shell
    $ make setup GDB_SERVER=openocd
    ```

1. Build the project.

    ```shell
    $ make
    ```

    * If you encounter an error at this point about a file not being found, it
        can be for one of two reasons:

        1. You do not have the 32 compatibility libraries installed (e.g.
            `lib32-glibc` on Arch Linux)

        2. There's an error with the Makefile that causes it to extract the
            Windows binaries, which can be corrected by running a few commands.

            ```make
            # remove the windows tools, if they were unpacked
            rm -rf ../../../tools/arm-none-eabi-gcc/4_8-2014q3
            # extract the linux tools to the expected location
            (cd ../../../tools/arm-none-eabi-gcc && tar -xjf gcc-arm-none-eabi-4_8-2014q3-20140805-linux.tar.bz2 && mv gcc-arm-none-eabi-4_8-2014q3 4_8-2014q3)
            ```

1. In a new terminal/tab, start the OpenOCD session. [^fn:7]

    ```shell
    $ sudo sh run_openocd.sh
    ```

1. Flash the new executable.

    ```shell
    $ make flash
    ```

1. Unplug the device, and plug it back in again. Connect and issue some commands.

    ```shell
    $ picocom -b 38400 /dev/ttyACM0

    # ATS?
    [ATS?]: _AT_SYSTEM_HELP_
    [ATS?]: COMPILE TIME: 2018/02/13-23:00:47
    [ATS?]: SW VERSION: v.3.4.20180213

    [MEM] After do cmd, available heap 59584

    # help

    WLAN AT COMMAND SET:
    ==============================
    1 Wlan Scan for Network Access Point
       # ATWS
    2 Connect to an AES AP
       # ATW0=SSID
       # ATW1=PASSPHRASE
       # ATWC
    3 Create an AES AP
       # ATW3=SSID
       # ATW4=PASSPHRASE
       # ATW5=CHANNEL
       # ATWA
    4 Ping
       # ATWI=xxx.xxx.xxx.xxx

    [MEM] After do cmd, available heap 59584
    ```

    * Press `^A^X` (ctrl-A, ctrl-X) to exit `picocom`.

1. If the above commands worked, you have successfully flashed the latest
    version of the sample project onto your RTL8710AF!

## Outcome

It took quite some time and research to determine a few steps of this process,
and while it was disappointing the v4.0b makefile had issues on my system, the
**Ameba SDK** documentation is surprisingly thorough otherwise. Debugging the
firmware update process from Linux was impossible (for me), and I still don't
know what caused the issue, unfortunately. Performing the update on Windows
performed flawlessly.

My next planned step is to publish a "Hello, world!" C application into RAM on
the chip, debug it successfully, then flash it to RAM and debug it
successfully.

Any comments, questions or tips, tweet me (see footer)!

## References

* [Japaric: Rust your ARM microcontroller!](http://blog.japaric.io/quickstart/)
* [Polyfractal: Rust on RTL8710AF running FreeRTOS](https://polyfractal.com/post/rustl8710/)

[^fn:1]: See the comments for [ncurses5-compat-libs](https://aur.archlinux.org/packages/ncurses5-compat-libs/) for more information.
[^fn:2]: If this version disappears from the Ameba site, someone might have mirrored it somewhere (search by filename!), but I don't feel comfortable sharing a "protected download" myself.
[^fn:3]: Such a group exists in other distros, and might have a name like `dialout`.
[^fn:4]: I use `sudo` to gain root privileges and perform system administration.
[^fn:5]: On any of the boards I've tried, the lack of helpful output from `help` is a sign they're running the stock sample app.
[^fn:6]: Big thanks to Nathael Pajani for this command from [this post on an MBED forum](https://os.mbed.com/questions/2708/Possible-to-flash-FW-with-linux/)
[^fn:7]: I want to work out how to do this without sudo, any pointers appreciated --- tweet me (see footer)!
