// videojuego
let game = {};

// Variables globales
let globales = {
    w: 800,
    h: 600,
    entreno: false,
    auto: false,
    mapa: {},
    tiempoBala: 0,
    tiempoDisparo: 0,
    tiempoMoverse: 0
};

// Motor del juego
let motor = {
    preload: function () {
        // Cargar los sprites  
        game.load.image('bullet', 'sprites/balaPlayer.png');
        game.load.image('enemyBullet', 'sprites/balaInvader.png');
        game.load.spritesheet('invader', 'sprites/invaider.png');
        game.load.image('ship', 'sprites/player.png');
        game.load.image('kaboom', 'sprites/explocion.png');
        game.load.image('menu', 'sprites/menu.png');
    },
    create: function () {
        // Iniciar Fisicas  
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Iniciar los objetos
        nave.player = game.add.sprite(400, 800, 'ship');
        nave.player.anchor.setTo(0.5, 0.5);
        game.physics.enable(nave.player, Phaser.Physics.ARCADE);
        nave.player.body.collideWorldBounds = true;

        nave.balas = game.add.group();
        nave.balas.enableBody = true;
        nave.balas.physicsBodyType = Phaser.Physics.ARCADE;
        nave.balas.createMultiple(1, 'bullet');
        nave.balas.setAll('anchor.x', 0.5);
        nave.balas.setAll('anchor.y', 1);
        nave.balas.setAll('outOfBoundsKill', true);
        nave.balas.setAll('checkWorldBounds', true);

        invaders.aliens = game.add.group();
        invaders.aliens.enableBody = true;
        invaders.aliens.physicsBodyType = Phaser.Physics.ARCADE;
        invaders.crear();
        invaders.calcularVivos();

        invaders.balas = game.add.group();
        invaders.balas.enableBody = true;
        invaders.balas.physicsBodyType = Phaser.Physics.ARCADE;
        invaders.balas.createMultiple(1, 'enemyBullet');
        invaders.balas.setAll('anchor.x', 0.5);
        invaders.balas.setAll('anchor.y', 1);
        invaders.balas.setAll('outOfBoundsKill', true);
        invaders.balas.setAll('checkWorldBounds', true);
        
        opciones.explosion.objetos = game.add.group();
        opciones.explosion.objetos.createMultiple(30, 'kaboom');
        opciones.explosion.objetos.forEach(opciones.explosion.animation, this);
        
        // Acciones de teclado
        opciones.teclas = game.input.keyboard.createCursorKeys();
        opciones.disparar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Menu de pausa
        opciones.pausa.objeto = game.add.text(globales.w-100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
        opciones.pausa.objeto.inputEnabled = true;
        opciones.pausa.objeto.events.onInputUp.add(opciones.pausa.pausar, self);
        game.input.onDown.add(opciones.pausa.salir, self);

        // Exportar la IA
        opciones.exportar = game.add.text(20, 20, 'Exportar', { font: '20px Arial', fill: '#fff' });
        opciones.exportar.inputEnabled = true;
        opciones.exportar.events.onInputUp.add(ia.exportar, self);
        
        // Ganaste mensaje
        opciones.ganaste = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
        opciones.ganaste.anchor.setTo(0.5, 0.5);
        opciones.ganaste.visible = false;

        // Linea divisoria
        game.add.text(0,400,' ---  ---  ---  ---  ---  --- ', { font: '84px Arial', fill: '#fff' }).inputEnabled = true;
        
        // IA
        ia.atacar.network = new synaptic.Architect.Perceptron(1, 2, 1);
        ia.atacar.entrenador = new synaptic.Trainer(ia.atacar.network);

        let inputLayer = new synaptic.Layer(3);
        let hiddenLayer = new synaptic.Layer(4);
        let outputLayer = new synaptic.Layer(2);
        outputLayer.set({
            squash: synaptic.Neuron.squash.ReLU,
            bias: 0.001
        });
        inputLayer.project(hiddenLayer);
        hiddenLayer.project(outputLayer);
        ia.defender.network = new synaptic.Network({
            input: inputLayer,
            hidden: [hiddenLayer],
            output: outputLayer
        });
        ia.defender.entrenador = new synaptic.Trainer(ia.defender.network);
    },
    render: function () {
        // Ver los objetos
        /* game.debug.body(nave.player);
        game.debug.body(invaders.cercano);
        game.debug.body(invaders.disparoActivo); */
    },
    update: function () {  
        // Si el jugddor esta vivo
        if (nave.player.alive) {
            // Si no has ganado 
            if(!opciones.ganaste.visible){
                // Reiniciar la velocidad y estatus del jugador
                nave.estatus = 0;
                nave.player.body.velocity.setTo(0, 0);

                // Disparos enemigos
                if (game.time.now > globales.tiempoDisparo) {
                    invaders.disparar();
                }
                
                // Coliciones de balas
                game.physics.arcade.overlap(nave.balas, invaders.aliens, invaders.morir, null, this);
                game.physics.arcade.overlap(invaders.balas, nave.player, nave.morir, null, this);

                
                // Si la nave sigue viva
                if (nave.vivo){
                    // Calcular entradas para el dataset e IA
                    let inputs = motor.calcularEntradas();

                    // Opciones del modo de juego
                    if (!globales.auto) {
                        // Modo manual y de entrenamiento
                        // Acciones del juguador cada cierto tiempo
                        if (globales.tiempoMoverse <= 5){
                            if (opciones.teclas.left.isDown) {
                                nave.izquierda();
                            }
                            else if (opciones.teclas.right.isDown) {
                                nave.derecha();
                            }
                        } else if (globales.tiempoMoverse >= 5){
                            globales.tiempoMoverse = 1;
                        }
                        globales.tiempoMoverse += 1;
                        if (opciones.disparar.isDown) {
                            nave.disparar();
                        }
                        // Lumbral de acciones de disparo y esquivar
                        if (invaders.disparoActivo.position.y >= 400 && invaders.disparoActivo.position.y <= 550) {
                            console.log(inputs[0]);
                            // Crear la salida del dataset depende de la direccion de la nave
                            let output = [0, 0];
                            if (nave.estatus == -1) {
                                output = [1, 0];
                            } else if (nave.estatus == 1) {
                                output = [0, 1];
                            }
                            // Formacion del dataset para la ia de defensa
                            ia.defender.dataset.push({
                                'input' :  inputs[0],
                                'output':  output
                            });
                        } else {
                            console.log(inputs[1]);
                            // Dataset para la ia de ataque
                            if (nave.estatus == 2){
                                ia.atacar.dataset.push({
                                    'input' :  inputs[1],
                                    'output':  [inputs[1][0] == -100 ? 0 : 1]
                                });
                            }
                        }
                    } else {
                        // Modo Auto
                        // Lumbral de acciones de disparo y esquivar
                        if (invaders.disparoActivo.position.y >= 400 && invaders.disparoActivo.position.y <= 550) {
                            // Mover dependiendo de la decicion de la IA cada cierto tiempo
                            if (globales.tiempoMoverse <= 4 ){
                                // Activar la IA
                                decision = ia.mover(inputs[0]);
                                if (decision == -1) {
                                    nave.izquierda();
                                } else if (decision == 1) {
                                    nave.derecha();
                                }
                            } else if (globales.tiempoMoverse >= 6){
                                globales.tiempoMoverse = 1;
                            }
                            globales.tiempoMoverse += 1;
                        } else {
                            // Decision de la IA si dispara
                            if(ia.disparar(inputs[1])){
                                nave.disparar();
                            }
                            globales.tiempoMoverse = 1;
                        }
                    }
                }
            }
        }
    },
    calcularEntradas: function () {
        // Posicion de la nave en x
        const naveX = parseFloat(nave.player.position.x.toFixed(2));

        // Calcular el invader mas cercano
        /* invaders.cercano = {}; */
        let cercanoY = -100; 
        for (let i = 0; i < invaders.vivos.length; i++) {
            if ((invaders.vivos[i].position.x + 160) >= (parseInt(naveX)-30) && (invaders.vivos[i].position.x + 160) <= (parseInt(naveX)+30)) {
                cercanoY = invaders.vivos[i].position.y;
                /* invaders.cercano = invaders.vivos[i]; */
            }
        }

        // Calcular los datos de la bala enemiga
        return [
            [
                motor.getAngulo(nave.player.position.x, nave.player.position.y, invaders.disparoActivo.position.x, invaders.disparoActivo.position.y),
                motor.getDistancia(nave.player.position.x, nave.player.position.y, invaders.disparoActivo.position.x, invaders.disparoActivo.position.y),
                naveX
            ],
            [cercanoY]
        ];
    },
    reiniciar: function () { 
        // Reinicar el jeugo 
        nave.player.revive();
        nave.player.position.x = 400;
        nave.balas.callAll('kill');
        nave.vivo = true;

        invaders.aliens.removeAll();
        invaders.crear();
        invaders.calcularVivos();
        invaders.balas.callAll('kill');
        
        opciones.explosion.objetos.callAll('kill');
        opciones.ganaste.visible = false;
    },
    ganar: function () {
        // Ganar el juego  
        invaders.balas.callAll('kill',this);
        opciones.ganaste.text = "Ganaste =(^-^)=";
        opciones.ganaste.visible = true;
    },
    getAngulo: function (x1, y1, x2, y2) {  
        return parseFloat((Math.atan2(y2 - y1, x2 - x1) * 180/ Math.PI).toFixed(2)) * -1;
    },
    getDistancia: function (x1, y1, x2, y2) {  
        return parseFloat(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)).toFixed(2));
    },
};

// Nave del jugador
let nave = {
    player: {},
    balas: {},
    estatus: 0,
    vivo: true,
    izquierda: function () {  
        // Moverse a la izquierda
        nave.player.body.velocity.x = -1500;
        nave.estatus = -1;
    },
    derecha: function () {
        // Moverse a la derecha
        nave.player.body.velocity.x = 1500;
        nave.estatus = 1;
    },
    disparar: function () {
        // Disparar para el jugador
        if (game.time.now > globales.tiempoBala) {
            bala = nave.balas.getFirstExists(false);
            if (bala){
                bala.reset(nave.player.x, nave.player.y + 8);
                bala.body.velocity.y = -2000;
                globales.tiempoBala = game.time.now + 200;
            }
            nave.estatus = 2;
        }
    },
    morir: function (player, bala) {  
        // Eliminar elementos
        bala.kill();
        player.kill();
        
        // Explotar la nave
        var explosion = opciones.explosion.objetos.getFirstExists(false);
        explosion.reset(player.body.x+30, player.body.y+10);
        explosion.play('kaboom', 30, false, true);
        invaders.balas.callAll('kill');
        opciones.pausa.pausar();
        nave.vivo = false;
        
        console.log('Perdio :C');
    }
};

// Enemigos
let invaders = {
    aliens: {},
    balas: {},
    vivos: [],
    cercano: {},
    disparoActivo: {},
    crear: function () {
        // Crear los enemigos
        invaders.aliens.length = 0;
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 7; x++) {
                var alien = invaders.aliens.create(x * 80, y * 50, 'invader');
                alien.anchor.setTo(0.5, 0.5);
                alien.body.moves = false;
            }
        }
        invaders.aliens.x = (globales.w/2)-250;
        invaders.aliens.y = 100;
    },
    disparar: function () {
        // Disparar balas enemigas
        bala = invaders.balas.getFirstExists(false);
        if (bala && invaders.vivos.length > 0) {
            let random = game.rnd.integerInRange(0, invaders.vivos.length-1);
            let disparador = invaders.vivos[random];
            bala.reset(disparador.body.x, disparador.body.y);
            game.physics.arcade.moveToObject(bala, nave.player, 500);
            globales.tiempoDisparo = game.time.now + 2000;
            invaders.disparoActivo = bala;
        }
    },
    morir: function (bala, alien) {
        // Eliminar objetos
        bala.kill();
        alien.kill();

        // Explotar alien
        var explosion = opciones.explosion.objetos.getFirstExists(false);
        explosion.reset(alien.body.x+30, alien.body.y+30);
        explosion.play('kaboom', 30, false, true);
        invaders.calcularVivos();

        // Saber si ya gano
        if (invaders.aliens.countLiving() == 0) {
            motor.ganar();
        }
    },
    calcularVivos: function () {
        // Calcular los enemigos vivos  
        invaders.vivos.length = 0;
        invaders.aliens.forEach(alien => {
            if (alien.alive)
                invaders.vivos.push(alien);
        });
    }
};

// Opciones del juego
let opciones = {
    pausa: {
        objeto: {},
        pausar: function () {  
            // Poner en pausa
            game.paused = true;
            opciones.menu = game.add.sprite(globales.w/2, globales.h/2, 'menu');
            opciones.menu.anchor.setTo(0.5, 0.5);
        },
        salir: function (e) {
            // Opciones de la pausa
            if (game.paused) {
                let menu_x1 = globales.w/2 - 270/2, 
                    menu_x2 = globales.w/2 + 270/2,
                    menu_y1 = globales.h/2 - 180/2, 
                    menu_y2 = globales.h/2 + 180/2;
                let mouse_x = e.x,
                    mouse_y = e.y;
                if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
                    console.clear();
                    // Distinguir las opciones
                    if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                        // Modo manual
                        alert('Modo Manual, Reiniciando dataset');
                        ia.dataset = [];
                        globales.entreno = false;
                        globales.auto = false;
                    } else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                        // Modo activo
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
    menu: {},
    explosion: {
        objetos:{},
        animation: function (invader) {
            // Expocion  
            invader.anchor.x = 0.5;
            invader.anchor.y = 0.5;
            invader.animations.add('kaboom');
        }
    },
    teclas: {},
    disparar: {},
    ganaste: {},
}

// Datos de la IA
let ia = {
    atacar: {
        nombre:'Jaeger',
        network: {},
        entrenador: {},
        dataset: []
    },
    defender: {
        nombre:'Ackerman',
        network: {},
        entrenador: {},
        dataset: []
    },
    entrenar: function () {  
        // Entrenar IA disparo
        console.log(`Entrenando a la IA (${ia.atacar.nombre})`);
        console.log("Entrenamiento con "+ ia.atacar.dataset.length +" valores" );
        ia.atacar.entrenador.train(ia.atacar.dataset, {rate: 0.03, iterations: 1000, shuffle: true});
        resultado = ia.atacar.network.activate(ia.atacar.dataset[0].input);
        error = Math.abs(ia.atacar.dataset[0].output[0] - resultado[0]);
        console.log(`Error: ${error}`);
        alert(`IA ${ia.atacar.nombre} Entrenada !!!`);

        // Entrenar IA defender
        console.log(`Entrenando a la IA (${ia.defender.nombre})`);
        console.log("Entrenamiento con "+ ia.defender.dataset.length +" valores" );
        ia.defender.entrenador.train(ia.defender.dataset, {rate: 0.0003, iterations: 10000, shuffle: true});
        resultado = ia.defender.network.activate(ia.defender.dataset[0].input);
        error = Math.abs(ia.defender.dataset[0].output[0] - resultado[0]);
        console.log(`Error 1: ${error}`);
        error = Math.abs(ia.defender.dataset[0].output[1] - resultado[1]);
        console.log(`Error 2: ${error}`);
        alert(`IA ${ia.defender.nombre} Entrenada !!!`);
    },
    disparar: function (input) {
        // Decide si disparar  
        resultado = ia.atacar.network.activate(input);
        console.log(resultado);
        if (resultado[0] > 0.9){
            return true;
        }
        return false;
    },
    mover: function (input) {  
        // Decide si moverse
        resultado = ia.defender.network.activate(input);
        console.log(resultado);
        if (resultado[0] > resultado[1]) { 
            return -1;
        } else if (resultado[0] < resultado[1]){
            return 1;
        }
        return 0;
    },
    exportar: function () {
        // Exportar las IAs de JSON
        download("ia_jaeger.json", `iaJsonA=[${JSON.stringify(ia.atacar.network.toJSON())}];`);
        download("ia_ackerman.json", `iaJsonD=[${JSON.stringify(ia.defender.network.toJSON())}];`);
    },
    importar: function () { 
        // Importar las IAs de los JSON
        ia.atacar.network = synaptic.Network.fromJSON(iaJsonA[0]);
        alert(`IA ${ia.atacar.nombre} Importada !!!`);
        ia.defender.network = synaptic.Network.fromJSON(iaJsonD[0]);
        alert(`IA ${ia.defender.nombre} Importada !!!`);
    }
};

// Iniciar el juego
$(document).ready(function () {
    game = new Phaser.Game(globales.w, globales.h, Phaser.AUTO, 'phaser-example', {
        preload: motor.preload, 
        create: motor.create, 
        update: motor.update, 
        render: motor.render 
    });
});