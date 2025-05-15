<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', [
                'admin',
                'vp',
                'director',
                'cleaning_coordinator',
                'general_coordinator',
                'coordinator',
                'worker'
            ]);
            $table->foreignId('campus_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('complaint_type_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
}; 