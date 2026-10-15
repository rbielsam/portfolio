<?php

use App\Http\Controllers\Api\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProfilePhotoController;
use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

// Autenticación por cookie de sesión (SPA stateful)
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Formulario de contacto público (con límite de envío)
Route::post('/contact/messages', [ContactMessageController::class, 'store'])
    ->middleware('throttle:contact-messages');

// Lectura pública
Route::get('/profile', [ProfileController::class, 'index']);
Route::get('/education', [EducationController::class, 'index']);
Route::get('/experience', [ExperienceController::class, 'index']);
Route::get('/projects', [ProjectController::class, 'index']);

// Escritura de contenido (solo administradores y editores)
Route::middleware(['auth:sanctum', 'role:admin,editor'])->group(function () {
    // Perfil
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfilePhotoController::class, 'store']);
    Route::put('/profile/photo', [ProfilePhotoController::class, 'update']);
    Route::delete('/profile/photo', [ProfilePhotoController::class, 'destroy']);

    // Formación
    Route::post('/education', [EducationController::class, 'store']);
    Route::put('/education/{id}', [EducationController::class, 'update']);
    Route::delete('/education/{id}', [EducationController::class, 'destroy']);

    // Experiencia
    Route::post('/experience', [ExperienceController::class, 'store']);
    Route::put('/experience/{id}', [ExperienceController::class, 'update']);
    Route::delete('/experience/{id}', [ExperienceController::class, 'destroy']);

    // Proyectos
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    // Contacto interno (solo administrador y editor)
    Route::get('/contact', [ContactController::class, 'index']);
    Route::post('/contact', [ContactController::class, 'store']);
    Route::put('/contact/{id}', [ContactController::class, 'update']);
    Route::delete('/contact/{id}', [ContactController::class, 'destroy']);

    // Mensajes de contacto recibidos
    Route::get('/admin/messages', [AdminMessageController::class, 'index']);
    Route::put('/admin/messages/{id}/read', [AdminMessageController::class, 'markAsRead']);
    Route::delete('/admin/messages/{id}', [AdminMessageController::class, 'destroy']);
});

// Gestión de usuarios (solo administrador)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [UserController::class, 'index']);
    Route::post('/admin/users', [UserController::class, 'store']);
    Route::put('/admin/users/{id}', [UserController::class, 'update']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
});
