"""
    Generar Dataset Fruta madura
"""

import numpy as np
import pandas as pd

def randomEntero(num1,num2, n):
    return np.random.randint(num1, num2, size=n)

if __name__ == '__main__':
    # Numero de registros
    numeroRegistros = 30

    # Dataset Mango
    print('Generando Dataset Mango . . .')
    registros = {}
    registros['Color Verde - Amarillo o Rojo (1-5)'] = randomEntero(4, 5, numeroRegistros)
    registros['Manchas (0-1)'] = randomEntero(0, 1, numeroRegistros)
    registros['Dureza (1-5)'] = randomEntero(3, 5, numeroRegistros)
    registros['Textura Suave (0-1)'] = randomEntero(0, 1, numeroRegistros)
    registros['Olor Dulce (0-1)'] = randomEntero(0, 1, numeroRegistros)

    dataset = pd.DataFrame(registros)
    dataset.to_csv("dataset_mango_maduro.csv", index=True)
    print('######################### Dataset - Mango #########################')
    print(dataset)

    # Dataset Jitomate
    registros = {}
    registros['Color Verde - Rojo (1-5)'] = randomEntero(3, 5, numeroRegistros)
    registros['Olor Fresco (0-1)'] = randomEntero(0, 1, numeroRegistros)
    registros['Dureza (1-5)'] = randomEntero(4, 5, numeroRegistros)
    registros['Tamaño (0-1)'] = randomEntero(0, 1, numeroRegistros)
    registros['Brillante (0-1)'] = randomEntero(0, 1, numeroRegistros)

    dataset = pd.DataFrame(registros)
    dataset.to_csv("dataset_jitomate_maduro.csv", index=True)
    print('######################### Dataset - Jitomate #########################')
    print(dataset)

    # Dataset Aguacate
    registros = {}
    registros['Color Cascara Verde a Negro (1-5)'] = randomEntero(4, 5, numeroRegistros)
    registros['Color Pulpa Verde o Oscura (1-5)'] = randomEntero(1, 2, numeroRegistros)
    registros['Suabidad (1-5)'] = randomEntero(2, 3, numeroRegistros)
    registros['Tallo (1-0)'] = randomEntero(0, 1, numeroRegistros)
    registros['Tamaño (1-0)'] = randomEntero(0, 1, numeroRegistros)

    dataset = pd.DataFrame(registros)
    dataset.to_csv("dataset_aguacate_maduro.csv", index=True)
    print('######################### Dataset - Aguacate #########################')
    print(dataset)