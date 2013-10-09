#from __future__ import print_function
import sys
import numpy
from sets import Set
import pickle

# DEFAULT_DICT_FILE = "/usr/share/dict/words"
DEFAULT_DICT_FILE = "./dict.txt"
MAX_COLS = 4
MAX_ROWS = 4


def main():
    grid = numpy.chararray((MAX_ROWS, MAX_COLS))
    for row in range(0, MAX_ROWS):
        line = sys.stdin.readline().strip()
        col = 0
        for c in line:
            grid[row, col] = c
            col += 1
    find_words(grid)


class WordDict:
    def __init__(self, dict_file=DEFAULT_DICT_FILE, format="text"):
        if format is "text":
            dict_file = open(dict_file, "r")
            self.dict = Set()
            for word in dict_file:
                word = word.strip().lower()
                self.dict.add(word)
            print("Read dictionary. Words: ", len(self.dict))
        elif format is "pickle":
            self.dict = pickle.load(open(dict_file, "rb"))


    def exists(self, word):
        word = word.lower()
        return word in self.dict

    def save(self, save_file="dict_set.p"):
        pickle.dump(self.dict, open(save_file, "wb"))


class Position:
    def __init__(self, row, col):
        self.row = row
        self.col = col


def find_words(grid):
    word_dict = WordDict(DEFAULT_DICT_FILE)
    visited = numpy.zeros((4, 4))
    found = Set()
    for row in range(0, MAX_ROWS):
        for col in range(0, MAX_COLS):
            path = [Position(row, col)]
            explore(grid, visited, row, col, word_dict, grid[row, col], path, found)


def explore(grid, visited_old, row, col, word_dict, word_part, path, found):
    visited = visited_old.copy()
    visited[row, col] = True
    #print visited

    neightbours = get_neighbours(row, col)
    for p in neightbours:
        if not visited[p.row, p.col]:
            word = word_part + grid[p.row, p.col]
            if word_dict.exists(word) and word not in found:
                new_path = list(path)
                new_path.append(p)
                print_path(word, new_path)
                found.add(word)
    for p in neightbours:
        if not visited[p.row, p.col]:
            word = word_part + grid[p.row, p.col]
            visited[p.row, p.col] = True
            new_path = list(path)
            new_path.append(Position(p.row, p.col))
            explore(grid, visited, p.row, p.col, word_dict, word, new_path, found)


def print_path(word, path):
    landscape = numpy.zeros((4, 4))

    if len(word) >= 5:
        print(word)
    index = 1
    for p in path:
        landscape[p.row, p.col] = index
        index += 1

    for row in range(0, MAX_ROWS):
        for col in range(0, MAX_COLS):
            print int(landscape[row, col]),
        print ""


def get_neighbours(row, col):
    neighbours = []
    for r in range(row - 1, row + 2):
        for c in range(col - 1, col + 2):
            #print r, c
            if (0 <= r < MAX_ROWS) and (0 <= c < MAX_COLS) and not (r == row and c == col):
                neighbours.append(Position(r, c))
    return neighbours


if __name__ == "__main__":
    main()
