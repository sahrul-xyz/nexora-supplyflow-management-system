<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['variants.stock', 'bomDetails.rawMaterial']);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('product_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $products = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function show($id)
    {
        $product = Product::with([
            'variants.stock',
            'bomDetails.rawMaterial.stock'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code' => 'required|string|max:30|unique:products,product_code',
            'product_name' => 'required|string|max:150',
            'category' => ['required', Rule::in(['shoes', 'sandals'])],
            'description' => 'nullable|string',
            'variants' => 'nullable|array',
            'variants.*.sku' => 'required|string|max:50|unique:product_variants,sku',
            'variants.*.size' => 'required|string|max:10',
            'variants.*.color' => 'required|string|max:50',
        ]);

        $product = Product::create([
            'product_code' => $validated['product_code'],
            'product_name' => $validated['product_name'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $v) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $v['sku'],
                    'size' => $v['size'],
                    'color' => $v['color'],
                    'is_active' => true,
                ]);

                InventoryStock::create([
                    'product_variant_id' => $variant->id,
                    'warehouse_type' => 'finished_goods',
                    'quantity' => 0,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dibuat.',
            'data' => $product->load('variants.stock'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'product_code' => ['required', 'string', 'max:30', Rule::unique('products')->ignore($product->id)],
            'product_name' => 'required|string|max:150',
            'category' => ['required', Rule::in(['shoes', 'sandals'])],
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data' => $product->load('variants.stock'),
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        // Soft deactivate as specified in PRD 4.2
        $product->is_active = !$product->is_active;
        $product->save();

        $statusText = $product->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Produk berhasil {$statusText}.",
            'data' => $product,
        ]);
    }
}
