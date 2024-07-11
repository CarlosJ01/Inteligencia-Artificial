"""
    Practica 06 Agentes Inteligentes
    Carlos Jahir Castro Cázares     17120151
    IA
"""


# Funcion para crear el cuadro magico
def crearCuadroMagicoImpar(n):
    # iniciar contadores
    i = 0
    j = int(n / 2)
    serie = 1
    matriz = [0] * n

    # LLenar la matriz de 0s
    for k in range(n):
        matriz[k] = [0] * n

    # Iniciamos en 1 el centro de la matriz
    matriz[i][j] = 1

    # Iniciamos el ciclo mientras todabia hay numeros (Arriba - Derecha o Abajo)
    while serie < (n * n):
        # Si se sale por arriba
        if (i-1) < 0:
            # Si se sale por la derecha
            if (j+1) >= n:
                # Si esta disponible desplazar
                if matriz[n-1][0] == 0:
                    i = n -1
                    j = 0
                # Si no poner abaja
                else:
                    i += 1
            # Si se mantiene dentro de la matriz por la derecha
            else:
                # Si esta disponible desplazar
                if matriz[n-1][j+1] == 0:
                    i = n -1
                    j += 1
                # Si no poner abaja
                else:
                    i += 1
        # Si se mantiene dentro de la matriz por arrbia
        else:
            # Si se sale por la derecha
            if (j + 1) >= n:
                # Si esta disponible desplazar
                if matriz[i-1][0] == 0:
                    i -= 1
                    j = 0
                # Si no poner abaja
                else:
                    i += 1
            # Si se mantiene dentro de la matriz por la derecha
            else:
                # Si esta disponible desplazar
                if matriz[i-1][j+1] == 0:
                    i-=1
                    j+=1
                # Si no poner abaja
                else:
                    i += 1
        serie += 1
        matriz[i][j] = serie

    return matriz


# Imprime el cuadro magico
def imprimirCuadro(cuadroMagico, n):
    for i in range(n):
        fila = ''
        numeroMagico = 0
        for j in range(n):
            numeroMagico += cuadroMagico[i][j]
            fila += '|\t'+str(cuadroMagico[i][j]) + '\t|'
        print(fila)
    print('Numero magico: ' + str(numeroMagico))


# Funcion principal
if __name__ == '__main__':
    print('################## CUADRO MAGICO (IMPAR) ##################')
    pasar = True
    while pasar:
        try:
            n = int(input('Ingresa un numero impar (Orden del cuadro): '))
            if n % 2 != 0 and n != 1:
                pasar = False
            else:
                print('Ingresa un numero impar y diferente de 1')
        except:
            print('Ingresa un numero')
    print('###################### CUADRO MAGICO ######################')
    cuadroMagico = crearCuadroMagicoImpar(n)
    imprimirCuadro(cuadroMagico, n)
