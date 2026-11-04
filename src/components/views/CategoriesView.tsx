import React, { useState } from 'react';
import { Plus, Tags, Trash2, Edit2, Check, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';

const iconColors = [
  '#f97316', '#ec4899', '#3b82f6', '#6366f1', '#eab308',
  '#ef4444', '#10b981', '#a855f7', '#06b6d4', '#64748b', '#16a34a',
];

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, editCategory, deleteCategory, filteredTransactions, currency, numberFormat } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(iconColors[0]);
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [newSubcats, setNewSubcats] = useState<string[]>([]);

  // Subcategory management state for existing category
  const [editingSubcatCatId, setEditingSubcatCatId] = useState<string | null>(null);
  const [quickSubcatText, setQuickSubcatText] = useState('');

  const displayCategories = categories.filter((c) => c.type === activeTab);

  const handleAddSubcatToNew = () => {
    if (newSubcatInput.trim() && !newSubcats.includes(newSubcatInput.trim())) {
      setNewSubcats([...newSubcats, newSubcatInput.trim()]);
      setNewSubcatInput('');
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      type: activeTab,
      icon: activeTab === 'income' ? 'TrendingUp' : 'ShoppingBag',
      color: newCatColor,
      subcategories: newSubcats,
    });

    setNewCatName('');
    setNewSubcats([]);
    setIsAddingCategory(false);
  };

  const handleAddSubcatToExisting = (cat: Category) => {
    if (!quickSubcatText.trim() || cat.subcategories.includes(quickSubcatText.trim())) return;
    editCategory(cat.id, {
      subcategories: [...cat.subcategories, quickSubcatText.trim()],
    });
    setQuickSubcatText('');
    setEditingSubcatCatId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Categories & Subcategories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize income sources and track spending buckets
          </p>
        </div>

        <button
          onClick={() => setIsAddingCategory(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Type Toggle Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
            activeTab === 'expense'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          <span>Expense Categories ({categories.filter((c) => c.type === 'expense').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
            activeTab === 'income'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          <span>Income Categories ({categories.filter((c) => c.type === 'income').length})</span>
        </button>
      </div>

      {/* Add Category Form Banner */}
      {isAddingCategory && (
        <form
          onSubmit={handleCreateCategory}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Create New {activeTab === 'income' ? 'Income' : 'Expense'} Category
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fitness & Sports, Subscriptions, Freelance"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {iconColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newCatColor === c ? 'scale-125 ring-2 ring-slate-400 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Add Initial Subcategories
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Protein, Gym, Equipment"
                value={newSubcatInput}
                onChange={(e) => setNewSubcatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcatToNew();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSubcatToNew}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200"
              >
                Add Subcategory
              </button>
            </div>
            {newSubcats.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newSubcats.map((sub) => (
                  <span
                    key={sub}
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    {sub}
                    <button
                      type="button"
                      onClick={() => setNewSubcats(newSubcats.filter((s) => s !== sub))}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg shadow-xs"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCategories.map((cat) => {
          // Calculate total transactions in this category for the filtered range
          const totalCatSpend = filteredTransactions
            .filter((t) => t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <div
              key={cat.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                </div>

                {cat.isCustom && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    title="Delete Category"
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Subcategories list */}
              <div>
                <div className="text-[11px] font-medium text-slate-400 mb-1.5">Subcategories:</div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                    >
                      {sub}
                    </span>
                  ))}
                  {editingSubcatCatId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Subcategory name"
                        value={quickSubcatText}
                        onChange={(e) => setQuickSubcatText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubcatToExisting(cat);
                        }}
                        className="px-2 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddSubcatToExisting(cat)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingSubcatCatId(null)}
                        className="p-1 text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSubcatCatId(cat.id)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline px-1 py-0.5"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>

              {/* Total recorded in this category */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total in Period:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(totalCatSpend, currency, numberFormat)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
