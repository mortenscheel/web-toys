<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/minesweeper', function () {
    return Inertia::render('Minesweeper');
})->name('minesweeper');
