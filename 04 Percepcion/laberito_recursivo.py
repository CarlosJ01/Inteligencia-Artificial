"""
    Practica 4 Percepción
    IA
    Carlos Jahir Castro Cázares     17120151
    Resolver laveritos recursivo
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

# Cordenadas de la solucion
solucion = [-1, -1]

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

#Encontrar la solucion de forma recursiva
def recorrerLaberito(i, j):
    #Comprobar si es pared o ya se paso por ahi
    if laberito[i][j] > 0 or laberito[i][j] < 4:
        #Comprobar si es una solucion o esta libre
        if laberito[i][j] == 2:
            #Se encotro el fin.
            solucion[0] = i
            solucion[1] = j
            return False
        elif laberito[i][j] == 1:
            # Imprimir el laberito
            imprimirLaberito(i, j)
            #Marcar de libre a que ya se paso
            laberito[i][j] = 3
            arriba = recorrerLaberito(i-1, j)
            if arriba:
                abajo = recorrerLaberito(i+1, j)
                if abajo:
                    izquierda = recorrerLaberito(i, j-1)
                    if izquierda:
                        derecha = recorrerLaberito(i, j+1)
                        if derecha:
                            #Marcar como que ya se paso pero no es solucion
                            laberito[i][j] = 4
                            return True
            return False
        else:
            return True
    else:
        return True

if __name__ == '__main__':
    #Encontrar la solucion
    recorrerLaberito(1, 1)
    if solucion[0] >= 0 and solucion[1] >= 0:
        print('. . . SOLUCION . . .')
        imprimirLaberito(solucion[0], solucion[1])
    else:
        print('. . . SOLUCION NO ENCONTRADA . . .')
        print('-----------------------------------------------------------------------------------------------------------')

    #Instrucciones
    print('# => Barrera')
    print('* => Libre')
    print('S => Camino de solucion')
    print('F => Final')
    print('A => Celda Actual')