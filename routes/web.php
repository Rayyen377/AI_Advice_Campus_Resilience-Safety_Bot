<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;

// Halaman utama → serahkan ke Inertia/React
Route::get('/', function () {
    return inertia('Home');
});

Route::get('/chat', fn() => inertia('Chat'));
Route::get('/chat/{mode}', fn($mode) => inertia('Chat', ['mode' => $mode]));

// Route mode chat
Route::get('/chat/{mode}', function ($mode) {
    $allowed = ['resilience', 'productivity', 'safety'];
    if (!in_array($mode, $allowed)) abort(404);
    return inertia('Chat', ['mode' => $mode]);
});

// API endpoint untuk Gemini
Route::post('/chat/send', [ChatController::class, 'send']);