import { Address } from "@/modules/branch/models/address";
import { Branch } from "@/modules/branch/models/branch";
import { User } from "@/modules/user/models/user";
import { Product } from "@/modules/product/models/product";
import { ProductInfo } from "@/modules/product/models/product-info";
import { Sale } from "@/modules/sale/models/sale";
import { SaleItem } from "@/modules/sale/models/sale-item";
import { Promotion } from "@/modules/promotion/models/promotion";
import { PromotionProduct } from "@/modules/promotion/models/promo-product";
import { Template } from "@/modules/notification/models/template";

import {
    CreateProductAndInfoTables,
    CreateUserAndBranchTables,
    CreateSaleAndSaleItemTables,
    CreatePromotionAndPromoProductTables,
    SetPromotionPerSale,
    PromotionPerSaleCanBeNull,
    CreateTemplateTable
} from "@/migrations";

import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.NODE_ENV === "test"
        ? process.env.DATABASE_HOSTNAME || "localhost"
        : process.env.DATABASE_HOSTNAME || "db",
    port: Number(process.env.DATABASE_PORT) || 5433,
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "postgres",

    migrationsRun: true,
    entities: [
        User,
        Branch,
        Address,
        Product,
        ProductInfo,
        Sale,
        SaleItem,
        Promotion,
        PromotionProduct,
        Template
    ],
    migrations: [
        CreateUserAndBranchTables,
        CreateProductAndInfoTables,
        CreateSaleAndSaleItemTables,
        CreatePromotionAndPromoProductTables,
        SetPromotionPerSale,
        PromotionPerSaleCanBeNull,
        CreateTemplateTable
    ]
});


export async function connect() {
    try {
        await AppDataSource.initialize();
        console.log("Database Connected!");
    } catch (error) {
        console.error("Starting Database Connection: ", error);
    }
}
