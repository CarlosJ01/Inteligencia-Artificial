// Videojuegos
let game= {};

// Motor del videojuego
let motor = {
    preload: function () {
        // Sprites
        game.load.image('fondo', 'sprites/space.jpg');
        game.load.image('nave', 'sprites/tie_figther.png');
        game.load.image('asteroide', 'sprites/asteroide.png');
        game.load.image('menu', 'sprites/menu.png');
        game.load.image('punto', 'sprites/punto.png');
    },
    create: function () {  
        // Activar fisicas
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Crear los objetos
        game.add.tileSprite(0, 0, globales.w, globales.h, 'fondo');

        nave.player = game.add.sprite((globales.w/2)-20, globales.h, 'nave');
        game.physics.arcade.enable(nave.player); // Activar Fisicas
        nave.player.body.collideWorldBounds = true; // Colision con el mundo
        nave.player.body.gravity.y = 0;// Gravedad
        nave.player.body.gravity.x = 0;
        nave.player.body.velocity.set(0); // Velocidades
        nave.puntos.lista.push(game.add.sprite(nave.player.position.x, nave.player.position.y, 'punto'));
        nave.puntos.lista.push(game.add.sprite(nave.player.position.x, nave.player.position.y, 'punto'));
        
        enemigo.crear();

        // Menu de pausa
        opciones.pausa.objeto = game.add.text(globales.w-100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
        opciones.pausa.objeto.inputEnabled = true;
        opciones.pausa.objeto.events.onInputUp.add(opciones.pausa.pausar, self);
        game.input.onDown.add(opciones.pausa.salir, self);

        // Exportacion de la IA
        opciones.exportar = game.add.text(20, 20, 'Exportar', { font: '20px Arial', fill: '#fff' });
        opciones.exportar.inputEnabled = true;
        opciones.exportar.events.onInputUp.add(ia.exportar, self);

        // Guia centro
        game.add.text(globales.w/2, 0, '#', { font: '20px Arial', fill: '#fff' });

        // Acciones
        opciones.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
        opciones.D = game.input.keyboard.addKey(Phaser.Keyboard.D);

        // Creacion de la red neuronal
        let inputLayer = new synaptic.Layer(3);
        let hiddenLayer = new synaptic.Layer(4);
        let outputLayer = new synaptic.Layer(2);
        outputLayer.set({
            squash: synaptic.Neuron.squash.ReLU,
            bias: 0.001
        });
        inputLayer.project(hiddenLayer);
        hiddenLayer.project(outputLayer);
        ia.network = new synaptic.Network({
            input: inputLayer,
            hidden: [hiddenLayer],
            output: outputLayer
        });
        ia.trainer = new synaptic.Trainer(ia.network);
    },
    render: function () {
        /* game.debug.body(nave.player);
        enemigo.asteroides.forEach(ateroide => {
            game.debug.body(ateroide);
        }); */
        enemigo.cercanos.forEach(ateroide => {
            game.debug.body(ateroide);
        });
    },
    update:function () {
        // Reiniciar velocidad del jugador
        nave.player.body.velocity.x = 0;
        nave.player.body.velocity.y = 0;
        nave.estatus = 0;

        // Colisiones de la nave con los asteroides
        for (let i = 0; i < enemigo.asteroides.length; i++) {
            game.physics.arcade.collide(nave.player, enemigo.asteroides[i], nave.impactar, null, this);
        }    

        // Reiniciar asteroides
        enemigo.reiniciar();

        // Calcular las entras 
        let inputs = motor.entradas();

        // Definir el modo de juego
        if (!globales.auto) {
            
            // Acciones del jugador
            if (globales.tiempoMoverse <= 4){
                if (opciones.A.isDown){
                    nave.izquierda();
                }
                else if (opciones.D.isDown){
                    nave.derecha();
                }
            } else if (globales.tiempoMoverse >= 6){
                globales.tiempoMoverse = 1;
            }
            globales.tiempoMoverse += 1;

            // Calcular la salida deseada
            if (inputs[1]){
                let output = [];
                switch (nave.estatus) {
                    case 0:
                        output = [0, 0]
                        break;
                    case -1:
                        output = [1, 0]
                        break;
                    case 1:
                        output = [0, 1]
                        break;
                }
    
                // Crear el dataset
                inputs[0].forEach(input => {
                    console.log(input);
                    ia.dataset.push({
                        'input' :  input,
                        'output':  output  
                    });
                });
            }
        } else{
            // Modo Automatico
            if (inputs[1]){
                if (globales.tiempoMoverse <= 2){
                    decision = ia.pensar(inputs[0]);
                    switch (decision) {
                        case -1:
                            nave.izquierda();
                            break;
                        case 1:
                            nave.derecha();
                            break;
                    }
                } else if (globales.tiempoMoverse >= 8){
                    globales.tiempoMoverse = 1;
                }
                globales.tiempoMoverse += 1;
            }
            globales.tiempoMoverse = 1;
        }

        // Actualizar puntos de referencia
        nave.puntos.actualizar();
    },
    getPosicionAleatoria: function () {
        // Optener una pocision aletoria para asteroides
        x = Math.floor(Math.random() * 40) * 10;
        y = Math.floor((Math.random() * 600) - 600);
        return [x, y];
    },
    reiniciar: function () { 
        //Reiniar todo el juego
        nave.player.position.x = (globales.w/2)-20;
        nave.player.position.y = globales.h;
        nave.player.body.velocity.set(0);
        nave.choques = 0;
        $('#numeroChoques').text("0");
        // Crear un jeugo
        enemigo.crear();
    },
    entradas: function () {
        // Cordenadas de todos los asteroides que estan en el area
        let inputs = [];
        let detecto = false;
        let naveX = parseFloat(nave.player.position.x.toFixed(2));
        // Calcular los asteroides en el area de accion
        enemigo.cercanos.length = 0;
        for (let i = 0; i < enemigo.asteroides.length; i++) {
            const ateroide = enemigo.asteroides[i];
            if (ateroide.position.x >= (nave.player.position.x-50) && ateroide.position.x <= (nave.player.position.x+100)){
                if (ateroide.position.y >= (nave.player.position.y-100) && ateroide.position.y <= nave.player.position.y){
                    enemigo.cercanos.push(ateroide);
                    inputs.push([
                        motor.getAngulo(nave.player.position.x, nave.player.position.y, ateroide.position.x, ateroide.position.y),
                        motor.getDistancia(nave.player.position.x, nave.player.position.y, ateroide.position.x, ateroide.position.y),
                        naveX
                    ]);
                    detecto = true
                }
            }
        }
        return [inputs, detecto]
    },
    getAngulo: function (x1, y1, x2, y2) {  
        return parseFloat((Math.atan2(y2 - y1, x2 - x1) * 180/ Math.PI).toFixed(2)) * -1;
    },
    getDistancia: function (x1, y1, x2, y2) {  
        return parseFloat(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)).toFixed(2));
    },
}

// Variables globales
let globales = {
    w: 400,
    h: 600,
    entreno: false,
    auto: false,
    tiempoMoverse: 1
}

// Opciones del Juego
let opciones = {
    pausa: {
        objeto: {},
        pausar: function () {
            // Pausar el jeugo
            game.paused = true;
            opciones.menu = game.add.sprite(globales.w/2, globales.h/2, 'menu');
            opciones.menu.anchor.setTo(0.5, 0.5);
        },
        salir: function (e) {  
            // Opciones de pausa
            if (game.paused) {
                let menu_x1 = globales.w/2 - 270/2, 
                    menu_x2 = globales.w/2 + 270/2,
                    menu_y1 = globales.h/2 - 180/2, 
                    menu_y2 = globales.h/2 + 180/2;
                let mouse_x = e.x,
                    mouse_y = e.y;
                if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ) {
                    console.clear();
                    if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                        // Modo manual
                        alert('Modo Manual, Reiniciando dataset');
                        ia.dataset = [];
                        globales.entreno = false;
                        globales.auto = false;
                    } else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                        // Modo automatico
                        alert('Modo Auto, Entrenando neurona');
                        if(!globales.entreno) {
                            let opcion = confirm("¿Desea entrenar la neurona? (Si no se carga la neurona del json)");
                            if (opcion)
                                ia.entrenar();
                            else
                                ia.importar();
                            globales.entreno=true;
                        }
                        globales.auto = true;
                    }
                    // Reiniciar el juego
                    opciones.menu.destroy();
                    opciones.menu = {};
                    motor.reiniciar();
                    game.paused = false;
                }
            }
        }
    },
    exportar: {},
    A: {},
    D: {},
    menu: {}
}

let nave = {
    player: {},
    impactar: function (player, asteroide) {
        // Impartar la nave con un asteroide aumentar el contador de choques
        nave.choques += 1;
        $('#numeroChoques').text(nave.choques);

        // Reiniciar el asteroide
        let cordenadas = motor.getPosicionAleatoria();
        asteroide.position.x = cordenadas[0];
        asteroide.position.y = cordenadas[1];
        game.physics.arcade.moveToObject(asteroide, nave.player, 200);
    },
    estatus: 0, // 0=> Quieto, -1=> Izquierda, 1=> Derecha
    izquierda: function () {
        // Mover a la izquierda
        nave.player.body.velocity.x = -1000;
        nave.estatus = -1;
    },
    derecha: function () {
        // Mover a la derecha
        nave.player.body.velocity.x = 1000;
        nave.estatus = 1;
    },
    puntos: {
        lista: [],
        actualizar: function () {  
            nave.puntos.lista[0].position.x = nave.player.position.x-50;
            nave.puntos.lista[0].position.y = nave.player.position.y-100;
            nave.puntos.lista[1].position.x = nave.player.position.x+100;
            nave.puntos.lista[1].position.y = nave.player.position.y-100;
        }
    },
    choques: 0
}

let enemigo = {
    asteroides: [],
    crear: function () {
        // Eliminar anteriores
        enemigo.asteroides.forEach(ateroide => {
            ateroide.kill();
            ateroide.destroy();
        });  
        enemigo.asteroides = [];

        // Crear nuevos asterorides
        let numeroOponentes = Math.floor((Math.random() * (6-1)) + 1);
        for (let i = 0; i < 5; i++) {
            cordenadas = motor.getPosicionAleatoria();
            let ateroide = game.add.sprite(cordenadas[0], cordenadas[1], 'asteroide');
            game.physics.arcade.enable(ateroide);
            ateroide.body.gravity.y = 0; 
            ateroide.body.gravity.x = 0;
            game.physics.arcade.moveToObject(ateroide, nave.player, 200);
            enemigo.asteroides.push(ateroide);
        }
    },
    reiniciar: function () {
        // Reiniar a los asteroides cuando se salgan del mapa
        enemigo.asteroides.forEach(ateroide => {
            if (ateroide.position.y >= globales.h){
                let cordenadas = motor.getPosicionAleatoria();
                ateroide.position.x = cordenadas[0];
                ateroide.position.y = cordenadas[1];
                game.physics.arcade.moveToObject(ateroide, nave.player, 200); 
            }
        });
    },
    cercanos: []
}

// IA (Red neuronal)
let ia = {
    name: 'Ayanami',
    network: {},
    trainer: {},
    dataset: [],
    entrenar: function () {
        // Entrenamiento de la neurona
        console.log(`Entrenando a la IA (${ia.name})`);
        console.log("Entrenamiento con "+ ia.dataset.length +" valores" );
        ia.trainer.train(ia.dataset, {rate: 0.0003, iterations: 10000, shuffle: true});

        // Test de la neurona
        console.log("Testiando la neurona" );
        let salir = [false, false, false];
        let resultado = [];
        for (let i = 0; i < ia.dataset.length; i++) {
            resultado = ia.network.activate(ia.dataset[i].input);
            const salida = ia.dataset[i].output;
            if (salida[0] == 0 && salida[1] == 0 && !salir[0]){
                console.log(`Desiados: ${salida[0]}, ${salida[1]}`);
                console.log(`Errores: ${Math.abs(salida[0] - resultado[0])}, ${Math.abs(salida[1] - resultado[1])}`);
                salir[0] = true;
            }
            if (salida[0] == 1 && salida[1] == 0 && !salir[1]){
                console.log(`Desiados: ${salida[0]}, ${salida[1]}`);
                console.log(`Errores: ${Math.abs(salida[0] - resultado[0])}, ${Math.abs(salida[1] - resultado[1])}`);
                salir[1] = true;
            }
            if (salida[0] == 0 && salida[1] == 1 && !salir[2]){
                console.log(`Desiados: ${salida[0]}, ${salida[1]}`);
                console.log(`Errores: ${Math.abs(salida[0] - resultado[0])}, ${Math.abs(salida[1] - resultado[1])}`);
                salir[2] = true;
            }

            if (salir[0] && salir[1] && salir[2]){
                break;
            }
        }
        alert(`IA ${ia.name} Entrenada !!!`);
    },
    pensar: function (inputs) {
        derecha = 0;
        izquierda = 0;
        // Calcular posibilidades
        inputs.forEach(input => {
            posibilidades = ia.network.activate(input);
            console.log(posibilidades);
            if (posibilidades[0] >= posibilidades[1])
                izquierda++;
            else
                derecha++;
        });
        if (izquierda > derecha)
            return -1;
        else if (izquierda < derecha)
            return 1;
        return 0;
    },
    exportar: function () {
        download("ia_ayanami.json", `iaJson=[${JSON.stringify(ia.network.toJSON())}];`);
    },
    importar: function () {
        ia.network = synaptic.Network.fromJSON(iaJson[0]);
        alert(`IA ${ia.name} Importada !!!`);
    }
}

// Iniciar el juego
$(document).ready(function () {
    game = new Phaser.Game(globales.w, globales.h, Phaser.CANVAS, '', {
        preload: motor.preload, 
        create: motor.create, 
        update: motor.update, 
        render: motor.render
    });
});