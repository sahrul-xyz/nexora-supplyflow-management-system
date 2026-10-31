<?php

namespace App\Http\Controllers;

use App\Models\ProductVariant;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductVariantController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductVariant::with(['product', 'stock']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhere('color', 'like', "%{$search}%")
                  ->orWhere('size', 'like', "%{$search}%");
            });
        }

        $variants = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $variants,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'sku' => 'required|string|max:50|unique:product_variants,sku',
            'size' => 'required|string|max:10',
            'color' => 'required|string|max:50',
            'initial_stock' => 'nullable|numeric|min:0',
        ]);

        $variant = ProductVariant::create([
            'product_id' => $validated['product_id'],
            'sku' => $validated['sku'],
            'size' => $validated['size'],
            'color' => $validated['color'],
            'is_active' => true,
        ]);

        InventoryStock::create([
            'product_variant_id' => $variant->id,
            'warehouse_type' => 'finished_goods',
            'quantity' => $validated['initial_stock'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Varian produk berhasil ditambahkan.',
            'data' => $variant->load('stock'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $variant = ProductVariant::findOrFail($id);

        $validated = $request->validate([
            'sku' => ['required', 'string', 'max:50', Rule::unique('product_variants')->ignore($variant->id)],
            'size' => 'required|string|max:10',
            'color' => 'required|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $variant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Varian produk berhasil diperbarui.',
            'data' => $variant->load('stock'),
        ]);
    }

    public function destroy($id)
    {
        $variant = ProductVariant::findOrFail($id);
        $variant->is_active = !$variant->is_active;
        $variant->save();

        $statusText = $variant->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Varian {$statusText}.",
            'data' => $variant,
        ]);
    }
}
