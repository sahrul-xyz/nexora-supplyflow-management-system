<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_order_id')->constrained('production_orders')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants');
            $table->unsignedInteger('target_quantity');
            $table->unsignedInteger('actual_quantity')->default(0);
            $table->unsignedInteger('passed_quantity')->default(0);
            $table->unsignedInteger('rejected_quantity')->default(0);
            $table->foreignId('qc_checked_by')->nullable()->constrained('users');
            $table->dateTime('qc_checked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_order_details');
    }
};
