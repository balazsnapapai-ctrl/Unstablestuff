package com.anomalousworld.structure;

import net.minecraft.component.DataComponentTypes;
import net.minecraft.component.type.WrittenBookContentComponent;
import net.minecraft.item.ItemStack;
import net.minecraft.item.Items;
import net.minecraft.text.RawFilteredPair;
import net.minecraft.text.Text;

import java.util.ArrayList;
import java.util.List;

/**
 * Procedural Generator for the 3 Lost Scholar Citadels:
 *  1. The Sunken Archives of the First Horizon (Overworld Abyss)
 *  2. The Pyrocene Caldera Scriptorium & Forge (Nether Farlands)
 *  3. The Panopticon of the Void Scholars (Underworld Spatial Pocket)
 *
 * Spawns ancient libraries housing written lore books authored by the long-lost geometers.
 */
public final class ScholarCitadelGenerator {
    private ScholarCitadelGenerator() {}

    public static ItemStack createScholarBook(String title, String author, String[] pages) {
        ItemStack book = new ItemStack(Items.WRITTEN_BOOK);
        List<RawFilteredPair<Text>> pageList = new ArrayList<>();
        for (String p : pages) {
            pageList.add(RawFilteredPair.of(Text.literal(p)));
        }
        WrittenBookContentComponent content = new WrittenBookContentComponent(
            RawFilteredPair.of(title),
            author,
            0,
            pageList,
            true
        );
        book.set(DataComponentTypes.WRITTEN_BOOK_CONTENT, content);
        return book;
    }
}
