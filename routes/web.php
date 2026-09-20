<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\main\CatalogController;
use App\Http\Controllers\main\DashboardController;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });


Route::get('/', [AuthController::class, 'loginScreen'])->name('login');

Route::prefix('/security')->group(function () {
Route::post('/validation', [AuthController::class, 'authenticate'])->name('authenticate')->middleware('throttle:5,1');
Route::get('/logout',[AuthController::class, 'logout'])->name('logout');
});


Route::prefix('/')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'main'])->name('homepage')->middleware('auth');
});

Route::prefix('/catalogos')->group(function () {
    Route::get('categorias', [CatalogController::class, 'listCategories'])->name('listCategories')->middleware('auth');
    Route::post('categorias', [CatalogController::class, 'addCategory'])->name('addCategory')->middleware('auth');
});
