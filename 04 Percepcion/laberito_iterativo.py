"""
    Practica 4 Percepción
    IA
    Carlos Jahir Castro Cázares     17120151
    Resolver laveritos iterativo
"""

# Laberito
laberito = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
"""
    0 => Paredes
    1 => Celdas Libres
    2 => Celda Final
    3 => Celdas de camino de solucion
    4 => Celsdas pasadas pero no son solucion
"""



# Imprimir el laberito actual y la fila y columna actual
def imprimirLaberito(i, j):
    for col in range(len(laberito)):
        fila = ""
        for row in range(len(laberito[col])):
            if i == col and j == row:
                fila += 'A\t'
            else:
                celda = laberito[col][row]
                if celda == 0:
                    fila += '#\t'
                elif celda == 1 or celda == 4:
                    fila += '*\t'
                elif celda == 3:
                    fila += 'S\t'
                elif celda == 2:
                    fila += 'F\t'
        print(fila)
    print('Fila actual: '+str(i))
    print('Columna actual: ' + str(i))
    print('-----------------------------------------------------------------------------------------------------------')

if __name__ == '__main__':
    # Pila de casillas pasadas y movimientos echos
    pila = [{
        'i': 1,
        'j': 1,
        'movimientos': ['o']
    }]
    # Cordenadas de la solucion
    solucion = [-1, -1]

    #Ciclo para resolver el laberito
    while(solucion[0] == -1 and solucion[1] == -1):
        # Terminar el ciclo si la pila esta vacia
        if len(pila) == 0:
            break

        # Obtener la ultima cordenada puesta en la pila
        i = pila[len(pila)-1]['i']
        j = pila[len(pila)-1]['j']
        movimientos = pila[len(pila)-1]['movimientos']

        # Si es un la cordenada actual esta libre, es el final o es solicion
        if 0 < laberito[i][j] < 4:
            # Si ya llego a la solucion
            if laberito[i][j] == 2:
                solucion[0] = i
                solucion[1] = j
                break
            elif laberito[i][j] == 1 or (laberito[i][j] == 3 and len(movimientos) > 1):
                # Imprimir el laberito
                imprimirLaberito(i, j)

                # Marcar de libre a que ya se paso
                laberito[i][j] = 3

                #Decidir que moviemiento hacer
                movimiento = movimientos[len(movimientos)-1]
                if movimiento == 'o':
                    # Arriba
                    pila.append({
                        'i': i-1,
                        'j': j,
                        'movimientos': ['o']
                    })
                    movimientos.append('^')
                elif movimiento == '^':
                    # Abajo
                    pila.append({
                        'i': i + 1,
                        'j': j,
                        'movimientos': ['o']
                    })
                    movimientos.append('v')
                elif movimiento == 'v':
                    # Izquierda
                    pila.append({
                        'i': i,
                        'j': j - 1,
                        'movimientos': ['o']
                    })
                    movimientos.append('<')
                elif movimiento == '<':
                    # Derecha
                    pila.append({
                        'i': i,
                        'j': j + 1,
                        'movimientos': ['o']
                    })
                    movimientos.append('>')
                elif movimiento == '>':
                    laberito[i][j] = 4
                    pila.pop()
            else:
                pila.pop()
        else:
            pila.pop()

    #Decision si encontro solucion al laberito
    if solucion[0] >= 0 and solucion[1] >= 0:
        print('. . . SOLUCION . . .')
        imprimirLaberito(solucion[0], solucion[1])
    else:
        print('. . . SOLUCION NO ENCONTRADA . . .')
        print('-----------------------------------------------------------------------------------------------------------')

    # Instrucciones
    print('# => Barrera')
    print('* => Libre')
    print('S => Camino de solucion')
    print('F => Final')
    print('A => Celda Actual')