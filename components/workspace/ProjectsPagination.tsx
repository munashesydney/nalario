"use client";

import React from "react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProjectsPaginationProps {
  workspaceId: string;
  currentPage: number;
  totalPages: number;
}

function buildHref(workspaceId: string, page: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/workspaces/${workspaceId}${qs ? `?${qs}` : ""}`;
}

export function ProjectsPagination({
  workspaceId,
  currentPage,
  totalPages,
}: ProjectsPaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display with ellipsis logic
  const pages: (number | "ellipsis")[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          {currentPage <= 1 ? (
            <PaginationPrevious className="pointer-events-none opacity-50" href="#" />
          ) : (
            <Link href={buildHref(workspaceId, currentPage - 1)} passHref legacyBehavior>
              <PaginationPrevious />
            </Link>
          )}
        </PaginationItem>

        {pages.map((page, idx) => {
          if (page === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <Link href={buildHref(workspaceId, page)} passHref legacyBehavior>
                <PaginationLink isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </Link>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          {currentPage >= totalPages ? (
            <PaginationNext className="pointer-events-none opacity-50" href="#" />
          ) : (
            <Link href={buildHref(workspaceId, currentPage + 1)} passHref legacyBehavior>
              <PaginationNext />
            </Link>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
