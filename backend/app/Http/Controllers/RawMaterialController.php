<?php

namespace App\Http\Controllers;

use App\Models\RawMaterial;
use App\Models\InventoryStock;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RawMaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = RawMaterial::with(['stock']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('material_name', 'like', "%{$search}%")
                  ->orWhere('material_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $materials = $query->orderBy('id', 'desc')->get()->map(function ($item) {
            $currentStock = $item->stock ? (float)$item->stock->quantity : 0.0;
            $item->is_low_stock = $currentStock <= (float)$item->minimum_stock;
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    public function show($id)
    {
        $material = RawMaterial::with(['stock', 'bomDetails.product'])->findOrFail($id);
        $currentStock = $material->stock ? (float)$material->stock->quantity : 0.0;
        $material->is_low_stock = $currentStock <= (float)$material->minimum_stock;

        return response()->json([
            'success' => true,
            'data' => $material,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'material_code' => 'required|string|max:30|unique:raw_materials,material_code',
            'material_name' => 'required|string|max:150',
            'unit' => 'required|string|max:20',
            'minimum_stock' => 'required|numeric|min:0',
            'initial_stock' => 'nullable|numeric|min:0',
        ]);

        $material = RawMaterial::create([
            'material_code' => $validated['material_code'],
            'material_name' => $validated['material_name'],
            'unit' => $validated['unit'],
            'minimum_stock' => $validated['minimum_stock'],
            'is_active' => true,
        ]);

        InventoryStock::create([
            'raw_material_id' => $material->id,
            'warehouse_type' => 'raw_material',
            'quantity' => $validated['initial_stock'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bahan baku berhasil ditambahkan.',
            'data' => $material->load('stock'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $material = RawMaterial::findOrFail($id);

        $validated = $request->validate([
            'material_code' => ['required', 'string', 'max:30', Rule::unique('raw_materials')->ignore($material->id)],
            'material_name' => 'required|string|max:150',
            'unit' => 'required|string|max:20',
            'minimum_stock' => 'required|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $material->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bahan baku berhasil diperbarui.',
            'data' => $material->load('stock'),
        ]);
    }

    public function destroy($id)
    {
        $material = RawMaterial::findOrFail($id);
        $material->is_active = !$material->is_active;
        $material->save();

        $statusText = $material->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Bahan baku berhasil {$statusText}.",
            'data' => $material,
        ]);
    }
}
