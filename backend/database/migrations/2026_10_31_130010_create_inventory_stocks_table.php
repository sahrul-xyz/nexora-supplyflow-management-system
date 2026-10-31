<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('raw_material_id')->nullable()->constrained('raw_materials')->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->enum('warehouse_type', ['raw_material', 'finished_goods']);
            $table->decimal('quantity', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['warehouse_type', 'raw_material_id'], 'unique_raw_material_stock');
            $table->unique(['warehouse_type', 'product_variant_id'], 'unique_variant_stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_stocks');
    }
};
