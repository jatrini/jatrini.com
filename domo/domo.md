# Domótica

- Dispositivos compatibles con Apple Home Kit.
    - Regleta Koogeek: O1EU Outlet. 3 enchufes + 3 USB de carga. Conectado también a Google Home.
    - Sensor Koogeek: DW1. No está conectado a Google Home.
- Dispositivos compatibles con Google Home.
    - Google:
        - Google Home Mini.
        - Termostato Nest.
    - Compatibles Smart Life (en SEP/2020 paso los dispositivos de Koogeek Life a Tuya Life, por incompatibilidad de la primera con Homebridge):
        - Koogeek: Mini Smart Plug. 2 unidades.
        - LoraTap Portalámpara wifi.
    - Compatibles Switchboot:
        - SwitchBot Hub Mini: Para conectividad wifi de los dispositivos Switchboot y Dispositivo de Infrarojos (automatización de mandos a distancia).
        - SwitchBot: Tres botones: 1xAire Acondicionado y 2xMotor Persiana.
- Automatizaciones con IFTTT.
    - Swichboot:
        - Subida y bajada de la Persiana. Trigger desde hora de amanecer y anochecer. Trigger desde Google Home. Trigger por Webhook.
        - Encendido y apagado del Aire Acondicionado Trigger desde Google Home. Trigger por Webhook.
        - Mando de la Televisión: Trigger desde Google Home (apagar, encender, mute, nombre de canales). Trigger de encendido y apagado por Webhook.
        - Mando de los Altavoces: Trigger desde Google Home. Trigger por Webhook.
    - Koogeek:
        - Apagar y Encender enchufes Smart Life. Trigger por Google Home. Trigger por  Webhook.
        - Apagar y Encender portalámpara Smart Life. Trigger por Google Home. Trigger por  Webhook.
    - Cambios en IFTTT SEP/2020, que pasa a cuentas pro y restringe a tres apletts por cuenta. Creo las cuentas siguientes (cada cuenta gestiona por Webhook un dispositivo):
        - dispositivo1@midominio
        ...
        - dispositivoN@midominio
- Raspberry Pi 4-4G (Servidor DHCP, DNS, OpenVPN, AFP y DLNA).
    - SO Raspbian full:
        - Imagen: 2020-05-27-raspios-buster-full-armhf
        - Tras actualizar: Linux pi 5.4.51-v7l+ #1327 SMP Thu Jul 23 11:04:39 BST 2020 armv7l GNU/Linux
    - Pi-hole:
        - Instalado desde [https://pi-hole.net/](https://pi-hole.net/)
        - Versión: Pi-hole v5.1.2 Web Interface v5.1.1 FTL v5.2.
        - DHCP:
            - Configuración básica:

                ```bash
                dhcp-range=192.168.1.100,192.168.1.150,24h
                dhcp-option=option:router,192.168.1.1
                dhcp-leasefile=/etc/pihole/dhcp.leases
                domain=local
                ```

            - Estáticos:

                ```
                dhcp-host=D8:FB:5E:28:DA:6E,192.168.1.1,Router
                ...
                ```

        - DNS:
            - Utiliza los DNS de Cloudflare (1.1.1.1 y 1.0.0.1).
        - Listas:
            - Las dos que trae originalmente.
            - Otra de dominios de adultos: [https://raw.githubusercontent.com/chadmayfield/my-pihole-blocklists/master/lists/pi_blocklist_porn_top1m.list](https://raw.githubusercontent.com/chadmayfield/my-pihole-blocklists/master/lists/pi_blocklist_porn_top1m.list)
        - Grupos:
            - Default (sin equipos).
            - Red (Equipos de Red). IPs .1 a .9.
            - Domo (Equipos de Domótica). IPs .10 a .14 (hubs) y .15 a .39 (dispositivos).
            - Media (Equipos de Vídeo y Sonido). IPs .40 a .49.
            - Móvil (Dispositivos Móviles). IPs .50 a .59.
            - Ordenadores (Ordenadores de Casa). IPs .60 a .69.
            - Trabajo (Dispositivos del Trabajo). IPs .70 a .79.
    - OpenVPN:
        - Instalado desde [https://www.pivpn.io/](https://www.pivpn.io/)
        - Se indica que use capacidades de Pi-hole para la resolución.
        - Se crea un usuario y su perfil.
        - En IOS, ese perfil se carga con la App de OpenVPN.
    - DNS dinámico (script):
        - Para actualizar el DNS dinámico del dominio de Google: [https://support.google.com/domains/answer/6147083?hl=es](https://support.google.com/domains/answer/6147083?hl=es)
        - Creo el script:

            ```bash
            pi@pi:~/dyndns $ more dyndns.sh 
            #!/bin/sh

            # Sacar IPs
            vpnip=$(nslookup <dominiodinamico.com> | tail -2 | sed -e 's/[A-Za-z: ]//g' -e '/^$/d')
            publicip=$(curl -s https://ipv4bot.whatismyipaddress.com/)

            # Comprobar
            echo $(date) "Comprobando Vpn:($vpnip)/Public:($publicip) ... \c"
            if [ $vpnip != $publicip ]
              then curl "https://<username>:<password>@domains.google.com/nic/update?hostname=<dominiodinamico.com>"
              echo "dominio actualizado"
              else echo "dominio sin actualizar"
            fi
            ```

        - Y las entradas en crontab:

            ```bash
            0 * * * * cd /home/pi/dyndns/ && ./dyndns.sh >>dyndns.txt
            0 0 * * 1 cd /home/pi/dyndns/ && mv dyndns.txt dyndns.old
            ```

    - Servidor AFP (nettalk):
        - Instalo servidor nettalk para acceder al contenido:

            ```
            sudo apt install netatalk
            ```

        - Lo configuro para el directorio donde descargaré contenido:

            ```
            pi@pi:~ $ sudo cat /etc/netatalk/afp.conf
            ;
            ; Netatalk 3.x configuration file
            ;

            [Global]
            ; Global server settings

            [Homes]
            ; basedir regex = /home

            [bitport]
            path =/home/pi/bitport

            [backups]
            path = /home/pi/backup/backups

            ; [My AFP Volume]
            ; path = 

            ; [My Time Machine Volume]
            ; path = /path/to/backup
            ; time machine = yes
            ```

    - Servidor DLNA:
        - Instalo servidor minidlna para acceder al contenido:

            ```
            sudo apt install minidlna
            ```

        - Lo configuro para el directorio donde descargaré contenido:

            ```
            pi@pi:~ $ sudo cat cat /etc/minidlna.conf

            # Port number for HTTP traffic (descriptions, SOAP, media transfer).
            # This option is mandatory (or it must be specified on the command-line using
            # "-p").
            port=8200

            # Name that the DLNA server presents to clients.
            # Defaults to "hostname: username".
            friendly_name=pi

            media_dir=/home/pi/bitport

            # Set this to merge all media_dir base contents into the root container
            # (The default is no.)
            merge_media_dirs=no
            ```

    - Descarga de contenido desde Bitport.io.
        - Mi script *baja.sh*:

            ```
            pi@pi:~ $ more baja.sh 
            #!/bin/bash
            TMPFILE=`mktemp`
            PWD=./bitport
            wget "$1" -O $TMPFILE
            unzip -d $PWD $TMPFILE
            rm $TMPFILE
            ```

    - ntopng (proyecto por abordar).
- Automatizaciones con Amazon Dash Buttons.
    - Configuración de los botones:
        - Pulsando el botón 5 segundos entra en modo de configuración. Levantan una wifi a la que nos podemos conectar, consultar el estado y mandar comandos mediante URLs:

            ```html
            http://192.168.0.1/
            http://192.168.0.1/?amzn_ssid=SSID&amzn_pw=CONTRASEÑA
            ```

    - Bloquear peticiones a servidores de Amazon:

        > > [dash-button-na-aws-opf.amazon.com](http://dash-button-na-aws-opf.amazon.com/)
        > [0.amazon.pool.ntp.org](http://0.amazon.pool.ntp.org/)
        > [1.amazon.pool.ntp.org](http://1.amazon.pool.ntp.org/)
        > [2.amazon.pool.ntp.org](http://2.amazon.pool.ntp.org/)
        > [3.amazon.pool.ntp.org](http://3.amazon.pool.ntp.org/)

        Mis filtros:

        ```
        (\.|^)amazon\.pool\.ntp\.org$
        dash-button-na-aws-opf.amazon.com
        dash-button-eu-aws-opf.amazon.com
        parker-gw-eu.amazon.com
        ```

    - Instalo [https://pypi.org/project/amazon-dash/](https://pypi.org/project/amazon-dash/) (v.1.4.0).
    - Configuro las acciones en (se podría invocando a IFTTT directamente, pero con los scripts se cubren distintos escenarios) */etc/amazon-dash.yml:*

        ```
        ## Script para alternar estados de la lámpara
          50:F5:DA:B9:B5:70:
            name: Scottex
            user: pi
            cmd: "/home/pi/button/lampara*"

          ## IFTTT para subir la persiana
          50:f5:da:ea:29:df:
            name: Guillette
            user: pi
            cmd: "/home/pi/button/persiana.sh"
        ```

    - Mis scripts para alternar estado y realizar varias acciones con el mismo botón:

        ```bash
        pi@pi:~/button $ more lamparaon.sh 
        #!/bin/sh

        # Al directorio
        cd /home/pi/button

        # Ultima vez ejecutado
        touch $(basename $0)

        # Por el nombre controlo estado, el script se invoca con lampara*
        if [ "$(basename $0)" = "lamparaon.sh" ]
          then mv ./lamparaon.sh ./lamparaoff.sh;
               curl https://maker.ifttt.com/trigger/lamparaon/with/key/cXXXX_XXXX
          else mv ./lamparaoff.sh ./lamparaon.sh;
               curl https://maker.ifttt.com/trigger/lamparaoff/with/key/cXXXX_XXXX
        fi
        ```

        ```bash
        pi@pi:~/button $ cat persiana.sh
        #!/bin/sh

        # Al directorio
        cd /home/pi/button

        # Si hace un minuto desde que se ha encendido la luz, bajar la persiana
        if [ ! -z $(find -iname "lamparaoff.sh" -mmin -1) ]
          then curl https://maker.ifttt.com/trigger/bajapersiana/with/key/cXXXX_XXXX
          else curl https://maker.ifttt.com/trigger/subepersiana/with/key/cXXXX_XXXX
        fi
        ```

- Homebridge (compatibilidad con HomeKit).
    - Instalación en la propia Raspeberry.
    - Usuario admin y user (con permisos reducidos).
    - Plugins → Accesorios:
        - Homebridge Nest homebridge-nest v4.4.10 → Nest: Termostato. Configuración complicada para cuentas Google.
        - TuyaWebPlatform @milo526/homebridge-tuya-web v0.4.7→ Dispositivos Tuya (menos la lámpara, que no la reconoce).
        - Homebridge Simple Http homebridge-simple-http v1.1.2 → Equipos Switchboot y la Lámpara Tuya: Por sus Webhook desde IFTTT.
        - Homebridge Pihole homebridge-pihole v0.3.1 → PiHole: Para activar y desactivar los filtros DNS. Se configura con su key.
        - Homebridge WoL homebridge-wol v4.3.0 → Alma (encendido del NAS).
        - Homebridge Camera FFmpeg homebridge-camera-ffmpeg v3.0.3 → Cámara Yi-Home 47US 720p. Le hago previamente a la cámara el hack Yi-hack v4. Con el plugin rtsp para streaming, que me cuesta 6$ licenciarlo para la cámara.
- Página de Control de Casa.
    - Enlace de la página web al directorio del servidor de pi-hole:

        ```bash
        pi@pi:~ $ ls -la /var/www/html
        drwxr-xr-x 7 root     root     4096 Aug 12 18:27 admin
        lrwxrwxrwx 1 root     root       25 Aug 22 19:38 casa.html -> /home/pi/button/casa.html
        -rw-r--r-- 1 www-data www-data   13 Aug 16 18:59 custom_disable_timer
        drwxr-xr-x 2 root     root     4096 Aug 12 20:24 pihole
        ```

    - Página web (con Bootstrap 4, responsive, y con ayuda):

        ```html
        <!DOCTYPE html>
        </script>
        <meta http-equiv=”Content-Type” content=”text/html; charset=UTF-8″ />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <head>
          <title>Control de casa</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
        <style>
          body {padding-top:20px; padding-bottom:20px}
          .btn:not(.btn-block) {width:100%; height:80px;}
          .popover {background:darkmagenta;color:darkmagenta;}
          .popover-body {color:white;}
        </style>
        <script>
          $(document).ready(function(){$('[data-toggle="popover"]').popover();});
          function loadDoc(url){var xhttp=new XMLHttpRequest();xhttp.open("GET",url,true);xhttp.send();}
        </script>
        </head>
        <body>
        <div class="container-fluid ">
          <div class="card border-info">
            <div class="card-header text-white bg-info"><h2 class="card-title"><span class="fas fa-home"></span> Control de casa</h2></div>
            <div class="card-body bg-light">
              <ul class="list-group">
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="bottom" title="Comandos de voz" data-content="OK Google:<br>- Enciende/apaga la lámpara.<br>También puedes usar el botón físico."><h3>Lámpara</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/lamparaon/with/key/cXXXX_XXXX')"><i class="fa fa-lightbulb"></i><br>Encender</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/lamparaoff/with/key/cXXXX_XXXX')"><i class="fa fa-lightbulb"></i><br>Apagar</button></div>
                  </div>
                </li>
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="bottom" title="Comandos de voz" data-content="OK Google:<br>- Sube/baja la persiana.<br>También puedes usar el botón físico.<br>Además sube y baja automáticamente cuando sale o se pone el sol."><h3>Persiana</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/subepersiana/with/key/cXXXX_XXXX')"><i class="fa fa-solar-panel"></i><br>Subir</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/bajapersiana/with/key/cXXXX_XXXX')"><i class="fa fa-solar-panel"></i><br>Bajar</button></div>
                  </div>
                </li>
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="top" title="Comandos de voz" data-content="OK Google:<br>- Enciende/apaga el aire."><h3>Aire</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/aireon/with/key/cXXXX_XXXX')"><i class="fa fa-wind"></i><br>Encender</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/aireon/with/key/cXXXX_XXXX')"><i class="fa fa-wind"></i><br>Apagar</button></div>
                  </div>  
                </li>
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="top" title="Comandos de voz" data-content="OK Google:<br>- Enciende/apaga la tele.<br>- Pon La Uno/La Dos/Antena 3/<br>&nbsp;&nbsp;&nbsp;Cuatro/Telecinco/La Sexta/<br>&nbsp;&nbsp;&nbsp;Telemadrid.<br>- Sube/baja el volumen de la tele.<br>- Pon/quita el mute de la tele."><h3>Televisión</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/TelevisionOn/with/key/cXXXX_XXXX')"><i class="fa fa-tv"></i><br>Encender</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/TelevisionOff/with/key/cXXXX_XXXX')"><i class="fa fa-tv"></i><br>Apagar</button></div>
                  </div>
                </li>
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="top" title="Comandos de voz" data-content="OK Google:<br>- Enciende/apaga Grititos."><h3>Grititos</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/GrititosOn/with/key/cXXXX_XXXX')"><i class="fa fa-music"></i><br>Encender</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/GrititosOff/with/key/cXXXX_XXXX')"><i class="fa fa-music"></i><br>Apagar</button></div>
                  </div>
                </li>
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="top" title="Comandos de voz" data-content="OK Google:<br>- Enciende/apaga el enchufe Pilar."><h3>Enchufe<br>Pilar</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/EnchufePilarOn/with/key/cXXXX_XXXX')"><i class="fa fa-plug"></i><br>Encender</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/EnchufePilarOff/with/key/cXXXX_XXXX')"><i class="fa fa-plug"></i><br>Apagar</button></div
                    </div>        
                </li>
                <li class="list-group-item bg-light">
                  <div class="row">
                    <div class="col-sm-4 d-flex align-items-center justify-content-center"><button type="button" class="btn btn-lg btn-light" data-toggle="popover" data-html="true" data-placement="top" title="Comandos de voz" data-content="OK Google:<br>- Enciende/apaga el enchufe Jose."><h3>Enchufe<br>Jose</h3></button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-warning btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/EnchufeJoseOn/with/key/cXXXX_XXXX')"><i class="fa fa-plug"></i><br>Encender</button></div>
                    <div class="col-sm-4 col-6"><button type="button" class="btn btn-dark btn-lg" onclick="loadDoc('https://maker.ifttt.com/trigger/EnchufeJoseOff/with/key/cXXXX_XXXX')"><i class="fa fa-plug"></i><br>Apagar</button></div>
                  </div>        
                </li>
              </ul>
          </div>
          <a href="http://192.168.1.4/admin" class="btn btn-info btn-lg btn-block" role="button"><span class="glyphicon glyphicon-globe"></span>Abrir web pi-hole</a>
          <a href="http://192.168.1.4:8888/accessories" class="btn btn-info btn-lg btn-block" role="button"><span class="glyphicon glyphicon-globe"></span>Abrir web Homebridge</a>
        </div>
        </body>
        </html>
        ```

- Panel de control con tablet Amazon Fire 7.
    - Resetearla y actualiza FireOS.
    - Permitir instalar APP desde otras fuentes.
    - Activar ADB en Opciones de Desarrollador. Este menú sale tras pulsar repetidamente sobre la versión.
    - Eliminar la pantalla de bloqueo:
        - Descargar APK Settings Database Editor 2018.10.31 By 4A:

            [Settings Database Editor 2018.10.31 APK Download by 4A - APKMirror](https://www.apkmirror.com/apk/4a/settings-database-editor/settings-database-editor-2018-10-31-release/settings-database-editor-2018-10-31-2-android-apk-download/download/)

        - Paso la APK por cable y la instalo.
        - Instalar ADB desde . Tras instalar la APK anterior:

            ```bash
            ./adb devices
            ./adb shell pm grant by4a.setedit22 android.permission.WRITE_SECURE_SETTINGS
            ```

        - Desde la APK buscar las entradas:
            - Secure Table → lockscreen_disabled. Cambiar de 0 a 1.
            - Global Table → device_provisioned. Cambiar de 1 a 0.
        - Reiniciar la tablet.
    - Kiosko:
        - Instalar Fully Kiosk Browser (versión concreta de FireOS), para la que compro la licencia PLUS (6.90€):

            [Fully Kiosk Browser](https://www.fully-kiosk.com/en/#download-box)

        - Paso la APK por cable y la instalo.
    - Configurar Kiosko: Para la URL de Control de la Casa.
- Hacer backup del servidor.
    - Script rsync:

        ```bash
        pi@pi:~/backup $ cat backup.sh 
        #!/bin/bash

        # Al directorio de backups
        cd /home/pi/backup/backups

        # Nombre del backup
        name=$(date | tr -d " :")

        # Hacer backup
        mkdir $name
        sudo rsync -aLmv --chown=pi:pi --include-from ../ficheros.txt / $name

        # Limpiar el directorio y los más antiguos de 10 dias
        zip -r $name.zip $name
        rm -r $name
        find . -mtime +10 -delete

        # Subir a Dropbox
        curl -X POST https://content.dropboxapi.com/2/files/upload \
          --header "Authorization: Bearer <KEY>" \
          --header "Dropbox-API-Arg: {\"path\": \"/$name.zip\",\"mode\": \"add\",\"autorename\": true,\"mute\": false,\"strict_conflict\": false}" \
          --header "Content-Type: application/octet-stream" \
          --data-binary @$name.zip
        ```

        - Para conectar con Dropbox hay que crear una aplicación en Dropbox para el acceso por API.
    - Fichero de entrada:

        ```bash
        pi@pi:~/backup $ cat ficheros.txt 
        + /etc
        + /etc/*/
        + *.yml
        + *.conf
        + /etc/host*
        + /etc/network/
        + /etc/network/***
        + /home/
        + /home/pi/
        - /home/pi/Bookshelf
        - /home/pi/bitport
        - /home/pi/backup/backups
        + /home/pi/***
        + /var/
        + /var/spool/
        + /var/spool/cron/
        + /var/spool/cron/crontabs/
        + /var/spool/cron/crontabs/***
        + /var/lib/
        + /var/lib/homebridge/
        + /var/lib/homebridge/***
        - *
        ```

    - Entrada en Crontab (ejecución todos los días a las 9h):

        ```bash
        0 9 * * * cd /home/pi/backup/ && ./backup.sh
        ```

- Dreamer (móvil conectado al puerto cargador del USB del despertador).
    - Cuenta Google secundaria.
    - Sin SIM, sólo conectado a Wifi.
    - Launcher: Before Launcher (versión gratuita).
    - Programas instalados accesibles desde la pantalla principal:
        - Endel → Música generativa.
        - Breathing → Respiración.
        - foobar2000 → Reproductor flac.
        - Aura → Mindfulness.
        - Pocket Casts → Podcasts.
        - Audials → Radio por Internet.
        - Avea → Control de la lámpara de mesa (bombilla colores).
        - weawow → Estación meteorológica.
