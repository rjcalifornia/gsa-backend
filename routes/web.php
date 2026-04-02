<?php

use App\Http\Controllers\auth\AuthController;
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
    Route::get('dashboard', function () {
        return view('welcome');
    })->name('homepage')->middleware('auth');
});
