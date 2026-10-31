<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique();
            $table->foreignId('partner_id')->constrained('partners');
            $table->foreignId('created_by')->constrained('users');
            $table->date('order_date');
            $table->enum('status', ['processing', 'shipped', 'delivered', 'cancelled'])->default('processing');
            $table->text('shipping_address');
            $table->string('tracking_number', 100)->nullable();
            $table->dateTime('shipped_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_orders');
    }
};
