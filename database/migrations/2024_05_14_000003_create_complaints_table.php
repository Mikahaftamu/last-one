<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_id')->unique();
            $table->foreignId('campus_id')->constrained()->onDelete('cascade');
            $table->foreignId('complaint_type_id')->constrained()->onDelete('cascade');
            $table->string('location');
            $table->text('description');
            $table->string('image_path')->nullable();
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed', 'verified'])->default('pending');
            $table->foreignId('assigned_coordinator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('assigned_worker_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
}; 