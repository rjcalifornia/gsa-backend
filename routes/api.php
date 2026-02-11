<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\ApiAuthController;


Route::prefix('/v1/security')->group(function () {
    Route::post('/authenticate', [ApiAuthController::class, 'login']);

    Route::post('/logout',[ApiAuthController::class, 'logout'])->middleware('auth:sanctum');
});