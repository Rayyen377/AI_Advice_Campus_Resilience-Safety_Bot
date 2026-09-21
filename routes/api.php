<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

Route::post('/chat/send', [ChatController::class, 'send']);

Route::get('/models', function () {
    $models = Gemini::models()->list();
    return response()->json($models);
});