import os
import tkinter as tk
from tkinter import filedialog
from PIL import Image
import json

input('1º: Select the image you want to classify')

root = tk.Tk()
root.withdraw()

image_path = filedialog.askopenfilename()
print('Image path:')
print(image_path)

print()
print()
input('2º: Select the Json to classify')

json_path = filedialog.askopenfilename()
print('Json path:')
print(json_path)

print()
print()
input('3º: Select the folder to save the classified images')

directory_path = filedialog.askdirectory()
print('Folder path:')
print(directory_path)

with open(json_path, 'r') as file:
  data = json.load(file)

width = data['resized']['width']
height = data['resized']['height']

grid = data['grid']
grid_top = grid['top']
grid_left = grid['left']
grid_width = grid['width']
grid_height = grid['height']

classification = data['classification']

width_margin = grid_width * 0.05
height_margin = grid_height * 0.05


im = Image.open(image_path).resize((width, height))

board = im.crop((
  grid_left - width_margin,
  grid_top - height_margin,
  grid_width + grid_left + width_margin,
  grid_height + grid_top + height_margin
))
board.save(directory_path + '/board.jpg')

square_w = grid_width / 5
square_h = grid_height / 5
square_mw = square_w * 0.1
square_mh = square_h * 0.1

for i in range(5):
  for j in range(5):
    square = im.crop((
      grid_left + (j * square_w) - square_mw,
      grid_top + (i * square_h) - square_mh,
      grid_left + ((j+1) * square_w) + square_mw,
      grid_top + ((i+1) * square_h) + square_mh,
    ))
    newPath = directory_path + '/' + classification[i][j]
    if not os.path.exists(newPath):
      os.mkdir(newPath)
    name = len(os.listdir(newPath))+1
    square.save(newPath + '/' + str(name) + '.jpg')


print('')
input('Done! You can check the folder.')

