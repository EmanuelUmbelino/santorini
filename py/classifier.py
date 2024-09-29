import os
import tkinter as tk
from tkinter import filedialog
from PIL import Image
import json
import time

image_path =  None
json_path = None
directory_path = None

if image_path is None:
  input('Select the image you want to classify')

  root = tk.Tk()
  root.withdraw()

  image_path = filedialog.askopenfilename()
  print('Image path:')
  print(image_path)

  print()

if json_path is None:
  input('Select the Json to classify')

  json_path = filedialog.askopenfilename()
  print('Json path:')
  print(json_path)

  print()

if directory_path is None:
  input('Select the folder to save the classified images')

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


im = Image.open(image_path).resize((width, height))

square_w = grid_width / 5
square_h = grid_height / 5
square_mw = square_w * 0.1
square_mh = square_h * 0.1

color_gray = 0
color_blue = 0

for i in range(5):
  for j in range(5):
    color = classification[i][j][1]
    if color == 'G':
        color_gray += 1
    if color == 'B':
      color_blue += 1

if color_gray != 2 or color_blue != 2:
  raise Exception("Invalid board")


for i in range(5):
  for j in range(5):
    square = im.crop((
      grid_left + (j * square_w) - square_mw,
      grid_top + (i * square_h) - square_mh,
      grid_left + ((j+1) * square_w) + square_mw,
      grid_top + ((i+1) * square_h) + square_mh,
    ))
    newPath = output_folder + '/' + classification[i][j]
    if not os.path.exists(newPath):
      os.mkdir(newPath)
    name = time.time()
    square.save(newPath + '/' + str(name) + '.jpg')
    time.sleep(0.01)
