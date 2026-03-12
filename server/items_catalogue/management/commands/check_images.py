"""
Management command to cross-check product images between the database and disk.

Usage:
    python manage.py check_images          # Full report
    python manage.py check_images --brief  # Summary only
"""
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from items_catalogue.models import Product


class Command(BaseCommand):
    help = "Cross-check product image references in the DB against files on disk"

    def add_arguments(self, parser):
        parser.add_argument(
            "--brief",
            action="store_true",
            help="Show summary counts only, skip per-item details",
        )

    def handle(self, *args, **options):
        brief = options["brief"]
        media_root = settings.MEDIA_ROOT
        catalogue_dir = os.path.join(media_root, "catalogue_images")

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Product Image Cross-Check ===\n"))
        self.stdout.write(f"MEDIA_ROOT: {media_root}")
        self.stdout.write(f"Catalogue dir: {catalogue_dir}\n")

        products = Product.objects.filter(is_archived=False).order_by("item_name", "id")
        total = products.count()

        # ------------------------------------------------------------------ #
        # 1. Products with NULL / empty image field
        # ------------------------------------------------------------------ #
        no_image = products.filter(image__isnull=True) | products.filter(image="")
        no_image = no_image.distinct().order_by("item_name", "id")
        no_image_list = list(no_image.values_list("id", "item_code", "item_name"))

        self.stdout.write(self.style.WARNING(
            f"\n[1] Products with NO image in DB: {len(no_image_list)} / {total}"
        ))
        if not brief and no_image_list:
            for pid, code, name in no_image_list:
                self.stdout.write(f"   id={pid:<5} code={code:<15} {name}")

        # ------------------------------------------------------------------ #
        # 2. Products whose image field points to a missing file on disk
        # ------------------------------------------------------------------ #
        has_image = products.exclude(image__isnull=True).exclude(image="")
        broken_refs = []
        valid_refs = []
        db_image_paths = set()

        for product in has_image.iterator():
            rel_path = product.image.name  # e.g. catalogue_images/2026/02/foo.png
            abs_path = os.path.join(media_root, rel_path)
            db_image_paths.add(os.path.normpath(rel_path))

            if os.path.isfile(abs_path):
                valid_refs.append((product.id, product.item_code, product.item_name, rel_path))
            else:
                broken_refs.append((product.id, product.item_code, product.item_name, rel_path))

        self.stdout.write(self.style.SUCCESS(
            f"\n[2] Products with VALID image on disk: {len(valid_refs)} / {total}"
        ))

        if broken_refs:
            self.stdout.write(self.style.ERROR(
                f"\n[3] Products with BROKEN image reference (file missing): {len(broken_refs)}"
            ))
            if not brief:
                for pid, code, name, path in broken_refs:
                    self.stdout.write(f"   id={pid:<5} code={code:<15} {name}")
                    self.stdout.write(f"         -> {path}")
        else:
            self.stdout.write(self.style.SUCCESS(
                "\n[3] Broken image references: 0  (all DB paths resolve to real files)"
            ))

        # ------------------------------------------------------------------ #
        # 3. Orphaned files on disk (not referenced by any product)
        # ------------------------------------------------------------------ #
        disk_files = set()
        if os.path.isdir(catalogue_dir):
            for dirpath, _dirnames, filenames in os.walk(catalogue_dir):
                for fname in filenames:
                    abs_path = os.path.join(dirpath, fname)
                    rel_path = os.path.relpath(abs_path, media_root)
                    disk_files.add(os.path.normpath(rel_path))

        orphaned = sorted(disk_files - db_image_paths)

        self.stdout.write(self.style.WARNING(
            f"\n[4] Orphaned files on disk (not referenced by any product): {len(orphaned)} / {len(disk_files)} total files"
        ))
        if not brief and orphaned:
            for path in orphaned:
                self.stdout.write(f"   {path}")

        # ------------------------------------------------------------------ #
        # Summary
        # ------------------------------------------------------------------ #
        self.stdout.write(self.style.MIGRATE_HEADING("\n--- Summary ---"))
        self.stdout.write(f"  Active products:        {total}")
        self.stdout.write(f"  With valid image:       {len(valid_refs)}")
        self.stdout.write(f"  With no image (null):   {len(no_image_list)}")
        self.stdout.write(f"  With broken reference:  {len(broken_refs)}")
        self.stdout.write(f"  Files on disk:          {len(disk_files)}")
        self.stdout.write(f"  Orphaned files:         {len(orphaned)}")
        self.stdout.write("")
